"""Testes dos projetos demonstrativos (só biblioteca padrão).

Rodar:  python -m unittest -v test_portfolio.py
"""
import contextlib
import io
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import gerador_descricoes as gd
import organizador_arquivos as org
import qualificador_leads_whatsapp as ql
import recuperador_pix_whatsapp as pix
import relatorio_vendas as rv


def silencioso(fn, *a, **k):
    with contextlib.redirect_stdout(io.StringIO()) as saida:
        r = fn(*a, **k)
    return r, saida.getvalue()


class Organizador(unittest.TestCase):
    def test_categorias(self):
        self.assertEqual(org.categoria_do_arquivo(Path("foto.JPG")), "imagens")
        self.assertEqual(org.categoria_do_arquivo(Path("nota.pdf")), "documentos")
        self.assertEqual(org.categoria_do_arquivo(Path("x.desconhecido")), "outros")

    def test_simulacao_nao_move_nada(self):
        with tempfile.TemporaryDirectory() as d:
            for nome in ("a.jpg", "b.pdf", "c.xlsx"):
                Path(d, nome).touch()
            silencioso(org.organizar, Path(d), por_data=False, executar=False)
            self.assertEqual(sorted(p.name for p in Path(d).iterdir()), ["a.jpg", "b.pdf", "c.xlsx"])

    def test_executar_move_para_pastas(self):
        with tempfile.TemporaryDirectory() as d:
            for nome in ("a.jpg", "b.pdf"):
                Path(d, nome).touch()
            silencioso(org.organizar, Path(d), por_data=False, executar=True)
            self.assertTrue(Path(d, "imagens", "a.jpg").exists())
            self.assertTrue(Path(d, "documentos", "b.pdf").exists())


class Relatorio(unittest.TestCase):
    def test_resumo(self):
        vendas = [
            {"data": "2026-08-01", "categoria": "Casa", "valor": "70"},
            {"data": "2026-09-03", "categoria": "Roupa", "valor": "59.9"},
            {"data": "2026-09-10", "categoria": "Casa", "valor": "120"},
        ]
        total, cat, mes = rv.gerar_resumo(vendas)
        self.assertAlmostEqual(total, 249.9)
        self.assertAlmostEqual(cat["Casa"], 190)
        self.assertAlmostEqual(mes["2026-09"], 179.9)

    def test_csv_com_bom_e_coluna_faltando(self):
        with tempfile.TemporaryDirectory() as d:
            bom = Path(d, "ok.csv")
            bom.write_text("data,produto,categoria,valor\n2026-08-01,Caneca,Casa,70\n", encoding="utf-8-sig")
            self.assertEqual(len(rv.carregar_vendas(bom)), 1)
            ruim = Path(d, "ruim.csv")
            ruim.write_text("data,produto,preco\n2026-08-01,Caneca,70\n", encoding="utf-8")
            with self.assertRaises(SystemExit) as erro:
                rv.carregar_vendas(ruim)
            self.assertIn("categoria", str(erro.exception))


class Qualificador(unittest.TestCase):
    def lead(self, prazo, orcamento="até R$ 350 mil", regiao="Zona Sul"):
        return ql.Lead(numero="+55 11 90000-0000", tipo_imovel="apto", regiao=regiao, orcamento=orcamento, prazo=prazo)

    def test_classificacao(self):
        self.assertEqual(ql.classificar_qualidade(self.lead("esse mês")), "QUENTE")
        self.assertEqual(ql.classificar_qualidade(self.lead("só pesquisando por enquanto")), "MORNO")
        self.assertEqual(ql.classificar_qualidade(self.lead("ainda pesquisando", orcamento="", regiao="")), "FRIO")

    def test_fluxo_demo_faz_as_quatro_perguntas(self):
        with mock.patch.object(ql, "enviar_mensagem_whatsapp") as enviar:
            lead, _ = silencioso(ql.qualificar, "+55", ["casa", "Centro", "R$ 500 mil", "esse mês"])
        self.assertEqual(enviar.call_count, 4)
        self.assertEqual(lead.regiao, "Centro")
        self.assertIn("QUENTE", ql.resumo_para_corretor(lead))


class RecuperadorPix(unittest.TestCase):
    def rodar(self, status):
        pedido = pix.Pedido(id="1", cliente="Ana", valor=189.9, status=status)
        with mock.patch.object(pix, "enviar_mensagem_whatsapp") as enviar:
            silencioso(pix.processar_pedido, pedido, "+55", minutos_acelerados=0)
        return enviar

    def test_pendente_envia_lembrete(self):
        enviar = self.rodar("pix_pendente")
        enviar.assert_called_once()
        self.assertIn("R$ 189.90", enviar.call_args[0][1])

    def test_pago_nao_envia(self):
        self.rodar("pago").assert_not_called()


class Gerador(unittest.TestCase):
    def test_sem_chave_usa_texto_local(self):
        texto, origem = gd.descrever("Caneca", ["300ml", "cerâmica"], "presente", chave=None)
        self.assertEqual(origem, "local")
        self.assertIn("300ml e cerâmica", texto)

    def test_falha_na_api_nao_derruba(self):
        with mock.patch.object(gd, "gerar_com_ia", side_effect=RuntimeError("API respondeu 401")):
            texto, origem = gd.descrever("Caneca", ["300ml"], "presente", chave="chave-falsa")
        self.assertTrue(origem.startswith("local (erro na IA"))
        self.assertIn("Caneca", texto)

    def test_resposta_da_api(self):
        resposta = io.BytesIO(b'{"content":[{"type":"text","text":"Caneca linda."}]}')
        resposta.__enter__ = lambda s=resposta: s
        resposta.__exit__ = lambda *a: False
        with mock.patch("urllib.request.urlopen", return_value=resposta) as abrir:
            self.assertEqual(gd.gerar_com_ia("prompt", "chave-falsa"), "Caneca linda.")
        req = abrir.call_args[0][0]
        self.assertEqual(req.get_header("X-api-key"), "chave-falsa")

    def test_lote_csv(self):
        with tempfile.TemporaryDirectory() as d:
            entrada, saida = Path(d, "p.csv"), Path(d, "s.csv")
            entrada.write_text("nome;caracteristicas;publico\nVaso;cerâmica,30cm;decoração\n", encoding="utf-8")
            with mock.patch.dict(os.environ, {"ANTHROPIC_API_KEY": ""}):
                silencioso(gd.main, ["--csv", str(entrada), "--saida", str(saida)])
            self.assertIn("Vaso", saida.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
