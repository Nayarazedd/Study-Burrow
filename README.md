# Study Burrow - Desenvolvimento Guiado por IA

Durante o desenvolvimento do Study Burrow, utilizei ferramentas de Inteligência Artificial (como o Google Gemini e o IA Studio) como assistentes de codificação. O objetivo foi acelerar a estruturação da lógica, mantendo o controle total sobre a arquitetura, o design e as regras de negócio exigidas pelo projeto. 

Abaixo estão exemplos reais dos prompts que utilizei para conduzir a IA, garantindo que ela respeitasse minhas restrições e implementasse as funcionalidades corretas.

## 1. Estruturação da Persistência de Dados (LocalStorage)
Para garantir que o aplicativo salvasse os dados localmente sem que a IA alterasse a interface que eu já havia desenhado, utilizei comandos restritivos.
**Prompt utilizado:**
> "O código HTML e CSS do meu aplicativo 'Study Burrow' já está pronto e não deve ser modificado. Crie apenas a lógica em JavaScript para a funcionalidade de adicionar tarefas no Organizador e salvar tudo no `LocalStorage` do navegador, garantindo que os dados não se percam ao atualizar a página."

## 2. Consumo da API e Regras de Negócio
Para conectar o assistente virtual (Coelho Sábio) e fazê-lo funcionar com a API, direcionei a IA para usar métodos modernos de requisição.
**Prompt utilizado:**
> "Preciso implementar o consumo da API REST do Google Gemini no meu projeto. Escreva a função JavaScript usando `fetch` e `async/await`. O código deve pegar a chave de API de forma segura. Retorne apenas o trecho da requisição e o tratamento da resposta, mantendo toda a minha estrutura original intacta."

## 3. Correção de Conflitos e Debugging
Durante a integração na plataforma de compilação, precisei colocar limites rígidos na IA para que ela focasse apenas no reparo cirúrgico dos erros.
**Prompt utilizado:**
> "O código que eu inseri já está com a lógica e o visual corretos. Identifique qual é o conflito que está gerando erro de execução no ambiente e corrija APENAS a linha problemática. Você deve manter 100% da minha estrutura, do meu LocalStorage, da minha chamada de API e do meu design absolutamente intactos."
