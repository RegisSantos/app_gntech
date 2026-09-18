# GnTech Weather API

API para consulta e persistência de dados climáticos por cidade.
O projeto foi estruturado para execução local em containers Docker, com a API FastAPI e banco MySQL 8.0.

Repositório: https://github.com/RegisSantos/app_gntech

## Stack Principal

- **Python 3.11**: linguagem da aplicação.
- **FastAPI**: framework HTTP e geração da documentação OpenAPI.
- **Uvicorn**: servidor ASGI usado para executar a API.
- **SQLAlchemy**: mapeamento objeto-relacional e acesso ao banco.
- **PyMySQL**: driver de conexão com o MySQL.
- **HTTPX**: cliente HTTP assíncrono para a OpenWeather API.
- **MySQL 8.0**: persistência dos históricos climáticos.
- **Docker e Docker Compose**: isolamento e orquestração dos serviços.

## Estrutura do Projeto

```text
.
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── routers/
│       └── services/
├── docker-compose.yml
└── README.md
```

O diretório `frontend/` existe na estrutura do repositório, mas atualmente não possui uma aplicação frontend implementada.
O consumo deve ser feito pela API e por sua documentação interativa.

## Requisitos

Instale os seguintes itens antes de iniciar:

1. **Git** para clonar o repositório.
2. **Docker Desktop** no Windows ou macOS, com Docker Compose habilitado; ou **Docker Engine + Docker Compose Plugin** no Linux.
3. Uma conta e uma chave de API da [OpenWeather](https://openweathermap.org/api).

Não é necessário instalar Python ou MySQL no host para executar a versão conteinerizada.
O Python e o MySQL são fornecidos pelos respectivos containers.

==========================================
Passo a Passo para Instalação e Execução:
==========================================

## Passo 1: Clonando o Projeto

Execute em um terminal:

```bash
git clone https://github.com/RegisSantos/app_gntech.git
cd app_gntech
```

## Passo 2: Criando o arquivo de ambiente (.env)

O backend utiliza o arquivo `backend/.env` para receber as variáveis de ambiente do container.
Depois de clonar o projeto, entre no diretório `backend` e copie o arquivo de exemplo:

Linux ou macOS:
```bash
cd backend
cp .env.example .env
cd ..
```

Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
cd ..
```

O arquivo `.env` é ignorado pelo Git e deve ser mantido apenas no ambiente local.

## Passo 3: Configurar as variáveis e a chave OpenWeather

Cada usuário deve gerar sua própria `OPENWEATHER_API_KEY` no portal da [OpenWeather](https://openweathermap.org/api).
A chave é obrigatória para as rotas de busca e salvamento do clima; sem ela, essas operações não funcionarão.

Abra o arquivo `backend/.env` recém-criado e substitua o valor de exemplo pela sua chave pessoal e ativa:

```env
OPENWEATHER_API_KEY=sua_chave_openweather
```

Não utilize a chave de outra pessoa nem publique uma chave real no repositório.
A aplicação lê `DATABASE_URL` e `OPENWEATHER_API_KEY` diretamente das variáveis de ambiente do container.
A geração da chave de API no portal da [OpenWeather] é gratuita.

## Passo 4: Subir os containers com Docker

Na raiz do projeto, execute o comando para construir e iniciar os serviços em segundo plano:

```bash
docker compose up --build
```

Em instalações antigas, o comando equivalente pode ser:

```bash
docker-compose up --build
```

Esse comando:

1. Constrói a imagem do backend usando `backend/Dockerfile`.
2. Baixa e inicia o MySQL 8.0.
3. Aguarda o MySQL passar no healthcheck.
4. Inicia a API na porta `8000`.
5. A aplicação FastAPI cria automaticamente a tabela de históricos no banco durante sua inicialização.

Portanto, NÃO é necessário executar um script SQL ou criar manualmente a tabela `weather_logs`.
Essa criação ocorre sempre que a aplicação FastAPI é inicializada, inclusive quando o container do backend sobe.

=========================
Comandos úteis do Docker
=========================

Para acompanhar os logs em tempo real:

```bash
docker compose logs -f gntech_backend
```

Para parar os containers:

```bash
docker compose down
```

Para remover também os dados persistidos do MySQL, use somente quando isso for desejado:

```bash
docker compose down -v
```

O volume `mysql_data` preserva os dados entre reinicializações normais.

## Passo 5: Configuração de Conexão com o Banco de Dados e a API

O `docker-compose.yml` cria automaticamente o serviço MySQL com estas configurações:

| Variável | Valor usado pelo Compose |
| --- | --- |
| Host para conexões feitas no host | `127.0.0.1` ou `localhost` |
| Host usado pela API dentro do Docker | `gntech_mysql` |
| Porta | `3306` |
| Banco | `gntech_db` |
| Usuário | `root` |
| Senha | `root` |

Se o usuário utilizar um cliente MySQL local (MySQL Workbench, DBeaver ou outro), deve criar uma conexão para o banco do projeto usando os valores acima.O banco `gntech_db` também é criado pelo Compose na primeira inicialização.

Mantenha as portas `3306` (MySQL) e `8000` (API) liberadas no firewall do host.
A porta `3306` é necessária para conexões externas ao container do banco; a porta `8000` é necessária para acessar a API.


## Acessando a API

Com os containers em execução, use:

- API base: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

### Healthcheck

Verifica se a API está respondendo:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{"status":"ok"}
```

### Consultar o clima de uma cidade

```bash
curl "http://localhost:8000/weather/search?city=Sao%20Paulo"
```

Essa rota consulta a OpenWeather e retorna cidade, país, temperatura, sensação térmica, mínima, máxima, umidade e descrição.

### Salvar uma consulta no histórico

```bash
curl -X POST "http://localhost:8000/weather/save?city=Sao%20Paulo"
```

A rota retorna `201 Created` e persiste o resultado na tabela `weather_logs`.

### Consultar o histórico

```bash
curl "http://localhost:8000/weather/history?skip=0&limit=10"
```

Os parâmetros `skip` e `limit` são opcionais. O histórico é retornado do registro mais recente para o mais antigo.

### Cenários de teste por ferramenta

#### Consultar dados salvos pelo navegador

Para verificar diretamente no navegador os registros salvos no banco de dados, acesse:

http://localhost:8000/weather/history

Essa URL executa uma requisição `GET` e exibe o histórico retornado pela API em formato JSON.

#### Consultar dados salvos pelo Postman

No Postman, crie uma requisição com:

- Método: `GET`
- URL: `http://localhost:8000/weather/history`

Opcionalmente, use os parâmetros `skip` e `limit`, por exemplo:

```text
http://localhost:8000/weather/history?skip=0&limit=10
```

#### Salvar dados pelo Postman

No Postman, crie uma requisição com:

- Método: `POST`
- URL: `http://localhost:8000/weather/save?city={nome_da_cidade}`

Substitua `{nome_da_cidade}` pelo nome da cidade desejada. Exemplo:

```text
http://localhost:8000/weather/save?city=Sao%20Paulo
```

Não é necessário enviar um corpo (`Body`) nessa requisição. Em caso de sucesso, a API retorna `201 Created` e o registro salvo.

#### Testar pela interface da API

Para testar a busca de clima, salvar dados e consultar o histórico pela interface interativa da API, acesse:

http://localhost:8000/docs#/

Na interface Swagger, selecione a operação desejada, clique em **Try it out**, informe a cidade quando necessário e execute em **Execute**. A operação `GET /weather/history` permite verificar os dados salvos na base.

## Execução Local Opcional

A instalação local serve principalmente para habilitar autocomplete e análise de código na IDE. A execução recomendada para avaliação continua sendo via Docker, pois o valor padrão da conexão usa o hostname interno `gntech_mysql`.

Na raiz do projeto, crie e ative um ambiente virtual:

**Windows PowerShell**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux ou macOS**

```bash
python3 -m venv venv
source venv/bin/activate
```

Em seguida, instale as dependências:

```bash
python -m pip install -r backend/requirements.txt
```

Para executar o backend fora do container, o MySQL precisa estar acessível e as variáveis `DATABASE_URL` e `OPENWEATHER_API_KEY` precisam ser configuradas no ambiente do terminal. Ao iniciar o servidor FastAPI dessa forma, a tabela `weather_logs` também é criada automaticamente no banco, desde que a conexão esteja disponível. O arquivo `backend/.env.example` é uma referência de nomes, mas o código atual não carrega esse arquivo automaticamente.

## Considerações sobre a IDE

Ao abrir os arquivos Python em uma IDE, como VS Code ou PyCharm, o analisador pode marcar imports como `fastapi` e `sqlalchemy` caso as dependências não estejam instaladas no interpretador selecionado. Isso é um alerta do ambiente local, não uma falha da imagem Docker.

Para remover esses alertas, selecione na IDE o interpretador do ambiente virtual criado acima. Também é possível configurar a IDE para utilizar o ambiente Python do container, caso esse seja o fluxo adotado pela equipe.

## Observações sobre o Ambiente Docker

A arquitetura atual foi preparada para rodar integralmente em containers Docker. O backend possui suas dependências na imagem criada a partir de `backend/Dockerfile`, e o Compose coordena a ordem de inicialização entre a API e o MySQL.

Assim, alertas de imports no host não impedem a execução conteinerizada. Para uma execução consistente em Windows, Linux ou macOS, mantenha o Docker em funcionamento, execute `docker compose up --build` na raiz do projeto e aguarde o healthcheck do banco antes de acessar a API.
