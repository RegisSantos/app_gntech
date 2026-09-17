Considerações sobre o Ambiente Local (IDE)

Ao abrir os arquivos .py deste projeto em sua IDE (como o VS Code, PyCharm, etc.), é possível que o sistema de análise de código (linter) aponte "erros" ou exiba linhas vermelhas sob as importações de pacotes (como fastapi, sqlalchemy, etc.).

Por que isso acontece?
Isso ocorre porque a arquitetura do projeto foi construída para rodar integralmente dentro de containers Docker. Todas as dependências e configurações residem no ambiente isolado do container. Se a sua máquina local (host) não possuir essas bibliotecas instaladas, a IDE não conseguirá mapeá-las, gerando um falso positivo de erro.

Isso afeta a execução?
Não. O projeto rodará perfeitamente quando os comandos do Docker forem executados (ex: docker build, docker-compose up), independentemente dos alertas visuais da sua IDE. O Docker provê o próprio sistema com tudo que é necessário para a aplicação funcionar de maneira idêntica em qualquer plataforma (Windows, Linux ou MacOS).

Como remover os alertas visuais da IDE (Opcional)
Caso deseje habilitar o autocompletar (IntelliSense) e remover as linhas vermelhas para facilitar a leitura do código, você pode instalar as dependências em um ambiente virtual local. Para isso, execute os seguintes comandos na raiz do projeto:

1. Crie um ambiente virtual (venv):
python -m venv venv

2. Ative o ambiente virtual:
No Windows (PowerShell):
.\venv\Scripts\Activate.ps1

No Linux / MacOS:
source venv/bin/activate

3. Instale as dependências localmente:
python -m pip install -r backend/requirements.txt

Nota: Após a instalação, certifique-se de que a sua IDE está utilizando o interpretador Python do ambiente virtual recém-criado (geralmente localizado na pasta venv).