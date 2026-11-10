# Portfolio — projetos demonstrativos da BLUE ROSE

Exemplos prontos para mostrar a clientes/leads como demonstração da
"Automação Express" (ver `vendas/oferta.md`, `memory/marca_blue_rose.md`).
Todos rodam com Python puro, sem instalar nada. São projetos demonstrativos
reais (o código roda de verdade) — não são trabalho encomendado por um
cliente, e devem ser apresentados como "projeto demonstrativo da BLUE ROSE",
nunca como case de cliente real.

## 1. `organizador_arquivos.py`
Organiza arquivos de uma pasta por tipo (e opcionalmente por data). Roda em
modo simulação por padrão — mostra o antes/depois sem mexer em nada real.

```
python organizador_arquivos.py "C:\caminho\da\pasta"
```

## 2. `relatorio_vendas.py`
Lê um CSV de vendas e gera um resumo (total geral, por categoria, por mês),
exportado para outro CSV. Bom exemplo para negócios que fazem relatório
manual em planilha toda semana/mês.

```
python relatorio_vendas.py vendas.csv
```

## 3. `gerador_descricoes.py`
Gera descrições de produto com IA. Com `ANTHROPIC_API_KEY` no ambiente, quem
escreve é o Claude (API oficial, chamada via HTTPS, sem bibliotecas extras).
Sem chave, ou se a API falhar, gera um texto local só com o que foi informado
e avisa a origem. Aceita um produto ou um lote via CSV (`nome;caracteristicas;publico`).

```
python gerador_descricoes.py --nome "Caneca" --caracteristicas "300ml,ceramica" --publico "presente"
python gerador_descricoes.py --csv produtos.csv --saida descricoes.csv
```

## 4. `qualificador_leads_whatsapp.py`
Simula a automação de qualificação de leads que a BLUE ROSE propõe pra
imobiliárias/corretores: faz uma sequência de perguntas pelo WhatsApp
(simulado) e entrega ao corretor um resumo classificado (QUENTE/MORNO/
FRIO), em vez de ele ter que ler a conversa inteira. O ponto de integração
real com a WhatsApp API está isolado numa função só.

```
python qualificador_leads_whatsapp.py --demo
```

## 5. `recuperador_pix_whatsapp.py`
Simula a automação de recuperação de venda: quando um PIX fica pendente
depois do checkout, manda lembrete automático pelo WhatsApp — e cancela o
envio se o pagamento já tiver caído. Os dois pontos de integração real
(consulta de pagamento e envio de WhatsApp) estão isolados em funções
próprias.

```
python recuperador_pix_whatsapp.py --pago-em nunca
python recuperador_pix_whatsapp.py --pago-em 1
```

## Como usar em uma conversa de venda
1. Rode o exemplo mais parecido com a dor do lead, na frente dele (ou grave
   uma tela rápida).
2. Explique: "isso aqui eu adapto pro seu caso específico em 2-3 dias".
3. Não prometa nada que ainda não foi testado com os dados reais do cliente —
   valide o formato dos dados dele antes de fechar preço.

## Testes

```
python -m unittest -v test_portfolio
```

13 testes cobrem os cinco scripts: categorias e simulação do organizador,
resumo e validação de colunas do relatório, regra de classificação do
qualificador (incluindo "só pesquisando por enquanto"), as duas saídas do
recuperador de PIX e as três origens do gerador (IA, local e falha da API).
