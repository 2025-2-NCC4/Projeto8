import pandas as pd
import re
import os

estabelecimento_para_categoria = {
    "Habib's": "Fast Food & Lanchonetes", 'Subway': "Fast Food & Lanchonetes", 'Burger King': "Fast Food & Lanchonetes",
    "McDonald's": "Fast Food & Lanchonetes", 'Açaí no Ponto': "Fast Food & Lanchonetes", 'Outback': "Restaurantes & Gastronomia",
    'Octavio Café': "Restaurantes & Gastronomia", 'Madero': "Restaurantes & Gastronomia", 'Café Cultura': "Restaurantes & Gastronomia",
    'Churrascaria Boi Preto': "Restaurantes & Gastronomia", 'Ráscal': "Restaurantes & Gastronomia", 'Smart Fit': "Academias",
    'Selfit': "Academias", 'Just Run': "Academias", 'Forever 21': "Moda & Varejo", 'Renner': "Moda & Varejo",
    'Riachuelo': "Moda & Varejo", 'Lojas Americanas': "Moda & Varejo", 'Havaianas': "Moda & Varejo", 'Sabin': "Saúde & Bem-estar",
    'Lavoisier': "Saúde & Bem-estar", 'Fleury': "Saúde & Bem-estar", 'Clube Pinheiros': "Saúde & Bem-estar",
    'Droga Raia': "Farmácias", 'Drogasil': "Farmácias", 'Drogaria São Paulo': "Farmácias", 'Extra': "Supermercados & Mercados",
    'Carrefour Express': "Supermercados & Mercados", 'Pão de Açúcar': "Supermercados & Mercados", 'Extra Mercado': "Supermercados & Mercados",
    'Starbucks': "Cafeterias", 'Ponto': "Lojas de Departamento & Eletrodomésticos", 'Casas Bahia': "Lojas de Departamento & Eletrodomésticos",
    'Magazine Luiza': "Lojas de Departamento & Eletrodomésticos", 'Fast Shop': "Lojas de Departamento & Eletrodomésticos",
    'Ponto Frio': "Lojas de Departamento & Eletrodomésticos", 'Sesc Paulista': "Cultura & Lazer", 'Sesc Carmo': "Cultura & Lazer",
    'Livraria Cultura': "Cultura & Lazer", 'Kalunga': "Papelaria e Escritório", 'Daiso Japan': "Lojas de Variedades",
}
tipo_loja_pedestres_map = {
    'mercado express': 'Supermercados & Mercados', 'outros': 'Outros', 'restaurante': 'Restaurantes & Gastronomia',
    'esportivo': 'Artigos Esportivos', 'farmácia': 'Farmácias', 'eletrodoméstico': 'Lojas de Departamento & Eletrodomésticos',
    'vestuário': 'Moda & Varejo', 'móveis': 'Móveis e Decoração', 'N/A': 'Não informado'
}

output_directory = '../datasets'
if not os.path.exists(output_directory):
    os.makedirs(output_directory)
    print(f"Directory '{output_directory}' created successfully.")

def corrigir_coordenadas(coord):
    if isinstance(coord, str):
        parts = coord.split('.')
        if len(parts) > 2:
            return parts[0] + '.' + ''.join(parts[1:])
    return coord

print("Cleaning Players Database...")
df_players = pd.read_csv('PicMoney-Base_Cadastral_de_Players-10_000 linhas (1).csv', delimiter=';')
df_players['celular'] = df_players['celular'].str.replace(r'\D', '', regex=True)
df_players['data_nascimento'] = pd.to_datetime(df_players['data_nascimento'], format='%d/%m/%Y', errors='coerce')
location_cols = ['cidade_trabalho', 'bairro_trabalho', 'cidade_escola', 'bairro_escola', 'categoria_frequentada']
for col in location_cols:
    df_players[col].fillna('Não informado', inplace=True)
output_path_players = os.path.join(output_directory, 'players_cleaned.csv')
df_players.to_csv(output_path_players, index=False)
print(f"-> '{output_path_players}' saved successfully.\n")

print("Cleaning Transactions Database...")
df_transacoes = pd.read_csv('PicMoney-Base_de_Transa__es_-_Cupons_Capturados-100000 linhas (1).csv', delimiter=';')
df_transacoes['celular'] = df_transacoes['celular'].str.replace(r'\D', '', regex=True)
df_transacoes['data'] = pd.to_datetime(df_transacoes['data'], format='%d/%m/%Y', errors='coerce')
df_transacoes['hora'] = pd.to_datetime(df_transacoes['hora'], format='%H:%M:%S', errors='coerce').dt.time
df_transacoes['produto'].fillna('N/A', inplace=True)
df_transacoes['valor_cupom'] = pd.to_numeric(df_transacoes['valor_cupom'], errors='coerce')
df_transacoes['repasse_picmoney'] = pd.to_numeric(df_transacoes['repasse_picmoney'], errors='coerce')
df_transacoes.dropna(subset=['valor_cupom', 'repasse_picmoney'], inplace=True)
df_transacoes['categoria_estabelecimento'] = df_transacoes['nome_estabelecimento'].map(estabelecimento_para_categoria).fillna('Outros')
output_path_transacoes = os.path.join(output_directory, 'transacoes_cleaned.csv')
df_transacoes.to_csv(output_path_transacoes, index=False)
print(f"-> '{output_path_transacoes}' saved successfully.\n")

print("Cleaning Pedestrians Database...")
df_pedestres = pd.read_csv('PicMoney-Base_Simulada_-_Pedestres_Av__Paulista-100000 linhas (1).csv', delimiter=';')
df_pedestres['celular'] = df_pedestres['celular'].str.replace(r'\D', '', regex=True)
df_pedestres['latitude'] = df_pedestres['latitude'].astype(str).apply(corrigir_coordenadas)
df_pedestres['longitude'] = df_pedestres['longitude'].astype(str).apply(corrigir_coordenadas)
df_pedestres['latitude'] = pd.to_numeric(df_pedestres['latitude'], errors='coerce')
df_pedestres['longitude'] = pd.to_numeric(df_pedestres['longitude'], errors='coerce')
df_pedestres['data'] = pd.to_datetime(df_pedestres['data'], format='%d/%m/%Y', errors='coerce')
df_pedestres['data_ultima_compra'] = pd.to_datetime(df_pedestres['data_ultima_compra'], format='%d/%m/%Y', errors='coerce')
df_pedestres['possui_app_picmoney'] = df_pedestres['possui_app_picmoney'].apply(lambda x: True if x == 'Sim' else False)
df_pedestres['ultimo_tipo_cupom'].fillna('N/A', inplace=True)
df_pedestres['ultimo_valor_capturado'].fillna(0, inplace=True)
df_pedestres['ultimo_tipo_loja'].fillna('N/A', inplace=True)
df_pedestres['ultimo_tipo_loja'] = df_pedestres['ultimo_tipo_loja'].map(tipo_loja_pedestres_map).fillna('Não informado')
output_path_pedestres = os.path.join(output_directory, 'pedestres_cleaned.csv')
df_pedestres.to_csv(output_path_pedestres, index=False)
print(f"-> '{output_path_pedestres}' saved successfully.\n")

print("Cleaning Stores Test Mass...")
df_lojas = pd.read_csv('PicMoney-Massa_de_Teste_com_Lojas_e_Valores-10000 linhas (1).csv', delimiter=';')
df_lojas['numero_celular'] = df_lojas['numero_celular'].str.replace(r'\D', '', regex=True)
df_lojas['latitude'] = df_lojas['latitude'].astype(str).apply(corrigir_coordenadas)
df_lojas['longitude'] = df_lojas['longitude'].astype(str).apply(corrigir_coordenadas)
df_lojas['latitude'] = pd.to_numeric(df_lojas['latitude'], errors='coerce')
df_lojas['longitude'] = pd.to_numeric(df_lojas['longitude'], errors='coerce')
df_lojas['data_captura'] = pd.to_datetime(df_lojas['data_captura'], format='%d/%m/%Y', errors='coerce')
df_lojas['valor_compra'] = pd.to_numeric(df_lojas['valor_compra'], errors='coerce')
df_lojas['valor_cupom'] = pd.to_numeric(df_lojas['valor_cupom'], errors='coerce')
df_lojas.dropna(subset=['valor_compra', 'valor_cupom'], inplace=True)
df_lojas['tipo_loja'] = df_lojas['nome_loja'].map(estabelecimento_para_categoria).fillna('Outros')
output_path_lojas = os.path.join(output_directory, 'lojas_cleaned.csv')
df_lojas.to_csv(output_path_lojas, index=False)
print(f"-> '{output_path_lojas}' saved successfully.\n")

print("Cleaning process completed!")