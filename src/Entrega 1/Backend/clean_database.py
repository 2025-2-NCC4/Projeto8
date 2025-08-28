import pandas as pd
import re


def corrigir_coordenadas(coord):
    """
    Corrige coordenadas que possuem múltiplos pontos decimais,
    mantendo apenas o primeiro ponto.
    Exemplo: '-23.558.579.334.631.800' vira '-23.558579334631800'
    """
    if isinstance(coord, str):
        parts = coord.split('.')
        if len(parts) > 2:
            return parts[0] + '.' + ''.join(parts[1:])
    return coord

# --- 1. Limpeza da Base Cadastral de Players ---
print("Iniciando limpeza da Base Cadastral de Players...")
df_players = pd.read_csv('PicMoney-Base_Cadastral_de_Players-10_000 linhas (1).csv', delimiter=';')

# Remove caracteres não numéricos da coluna 'celular'
df_players['celular'] = df_players['celular'].str.replace(r'\D', '', regex=True)

# Converte 'data_nascimento' para o formato datetime
df_players['data_nascimento'] = pd.to_datetime(df_players['data_nascimento'], format='%d/%m/%Y', errors='coerce')

# Preenche valores nulos em colunas de localização com 'Não informado'
location_cols = ['cidade_trabalho', 'bairro_trabalho', 'cidade_escola', 'bairro_escola', 'categoria_frequentada']
for col in location_cols:
    df_players[col].fillna('Não informado', inplace=True)

# Salva o arquivo limpo
df_players.to_csv('players_cleaned.csv', index=False)
print("-> 'players_cleaned.csv' salvo com sucesso.\n")


# --- 2. Limpeza da Base de Transações - Cupons Capturados ---
print("Iniciando limpeza da Base de Transações...")
df_transacoes = pd.read_csv('PicMoney-Base_de_Transa__es_-_Cupons_Capturados-100000 linhas (1).csv', delimiter=';')

# Remove caracteres não numéricos da coluna 'celular'
df_transacoes['celular'] = df_transacoes['celular'].str.replace(r'\D', '', regex=True)

# Converte 'data' para datetime e 'hora' para o formato de tempo
df_transacoes['data'] = pd.to_datetime(df_transacoes['data'], format='%d/%m/%Y', errors='coerce')
df_transacoes['hora'] = pd.to_datetime(df_transacoes['hora'], format='%H:%M:%S', errors='coerce').dt.time

# Preenche valores nulos na coluna 'produto' com 'N/A'
df_transacoes['produto'].fillna('N/A', inplace=True)

# Converte colunas de valor para numérico, tratando possíveis erros
df_transacoes['valor_cupom'] = pd.to_numeric(df_transacoes['valor_cupom'], errors='coerce')
df_transacoes['repasse_picmoney'] = pd.to_numeric(df_transacoes['repasse_picmoney'], errors='coerce')

# Remove linhas onde a conversão para número falhou (se houver)
df_transacoes.dropna(subset=['valor_cupom', 'repasse_picmoney'], inplace=True)

# Salva o arquivo limpo
df_transacoes.to_csv('transacoes_cleaned.csv', index=False)
print("-> 'transacoes_cleaned.csv' salvo com sucesso.\n")


# --- 3. Limpeza da Base Simulada - Pedestres Av. Paulista ---
print("Iniciando limpeza da Base de Pedestres...")
df_pedestres = pd.read_csv('PicMoney-Base_Simulada_-_Pedestres_Av__Paulista-100000 linhas (1).csv', delimiter=';')

# Remove caracteres não numéricos da coluna 'celular'
df_pedestres['celular'] = df_pedestres['celular'].str.replace(r'\D', '', regex=True)

# Aplica a função de correção nas coordenadas
df_pedestres['latitude'] = df_pedestres['latitude'].astype(str).apply(corrigir_coordenadas)
df_pedestres['longitude'] = df_pedestres['longitude'].astype(str).apply(corrigir_coordenadas)
df_pedestres['latitude'] = pd.to_numeric(df_pedestres['latitude'], errors='coerce')
df_pedestres['longitude'] = pd.to_numeric(df_pedestres['longitude'], errors='coerce')

# Converte colunas de data para o formato datetime
df_pedestres['data'] = pd.to_datetime(df_pedestres['data'], format='%d/%m/%Y', errors='coerce')
df_pedestres['data_ultima_compra'] = pd.to_datetime(df_pedestres['data_ultima_compra'], format='%d/%m/%Y', errors='coerce')

# Converte 'possui_app_picmoney' para booleano (True/False)
df_pedestres['possui_app_picmoney'] = df_pedestres['possui_app_picmoney'].apply(lambda x: True if x == 'Sim' else False)

# Preenche valores ausentes em colunas específicas
df_pedestres['ultimo_tipo_cupom'].fillna('N/A', inplace=True)
df_pedestres['ultimo_valor_capturado'].fillna(0, inplace=True)
df_pedestres['ultimo_tipo_loja'].fillna('N/A', inplace=True)

# Salva o arquivo limpo
df_pedestres.to_csv('pedestres_cleaned.csv', index=False)
print("-> 'pedestres_cleaned.csv' salvo com sucesso.\n")


# --- 4. Limpeza da Massa de Teste com Lojas e Valores ---
print("Iniciando limpeza da Massa de Teste de Lojas...")
df_lojas = pd.read_csv('PicMoney-Massa_de_Teste_com_Lojas_e_Valores-10000 linhas (1).csv', delimiter=';')

# Remove caracteres não numéricos da coluna 'numero_celular'
df_lojas['numero_celular'] = df_lojas['numero_celular'].str.replace(r'\D', '', regex=True)

# Aplica a função de correção nas coordenadas
df_lojas['latitude'] = df_lojas['latitude'].astype(str).apply(corrigir_coordenadas)
df_lojas['longitude'] = df_lojas['longitude'].astype(str).apply(corrigir_coordenadas)
df_lojas['latitude'] = pd.to_numeric(df_lojas['latitude'], errors='coerce')
df_lojas['longitude'] = pd.to_numeric(df_lojas['longitude'], errors='coerce')

# Converte 'data_captura' para o formato datetime
df_lojas['data_captura'] = pd.to_datetime(df_lojas['data_captura'], format='%d/%m/%Y', errors='coerce')

# Converte colunas de valor para numérico
df_lojas['valor_compra'] = pd.to_numeric(df_lojas['valor_compra'], errors='coerce')
df_lojas['valor_cupom'] = pd.to_numeric(df_lojas['valor_cupom'], errors='coerce')

# Remove linhas onde a conversão para número falhou (se houver)
df_lojas.dropna(subset=['valor_compra', 'valor_cupom'], inplace=True)

# Salva o arquivo limpo
df_lojas.to_csv('lojas_cleaned.csv', index=False)
print("-> 'lojas_cleaned.csv' salvo com sucesso.\n")

print("Processo de limpeza concluído!")