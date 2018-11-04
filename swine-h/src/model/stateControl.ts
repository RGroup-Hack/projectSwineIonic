export class StateControl {
    private botoesIniciais: Boolean;
    public get isBotoesIniciais() : Boolean
    {
        return this.botoesIniciais;
    }

    private criarAjuda: Boolean;
    public get isCriarAjuda() : Boolean
    {
        return this.criarAjuda;
    }
    
    private cardListaPessoas: Boolean;
    public get isCardListaPessoas() : Boolean {
        return this.cardListaPessoas;
    }
    
    private cardDetalhePessoa: Boolean;
    public get isCardDetalhePessoa() : Boolean {
        return this.cardDetalhePessoa;
    }
    
    private cardOpcoesAjudante: Boolean;
    public get isCardOpcoesAjudante() : Boolean {
        return this.cardOpcoesAjudante;
    }
    

    constructor() {
        this.botoesIniciais = true;
        this.cardListaPessoas = false;
        this.cardDetalhePessoa = false;
        this.cardOpcoesAjudante = false;
        this.criarAjuda = false;
    }

    setState(state: String) {
        switch (state) {
            case "queroAjudar":
                this.botoesIniciais = false;
                this.cardListaPessoas = true;
                this.cardDetalhePessoa = false;
                this.cardOpcoesAjudante = false;
                this.criarAjuda = false;
                break;
            case "detalheAjuda":
                this.botoesIniciais = false;
                this.cardListaPessoas = false;
                this.cardDetalhePessoa = true;
                this.cardOpcoesAjudante = false;
                this.criarAjuda = false;
                break;
            case "criarAjuda":
                this.botoesIniciais = false;
                this.cardListaPessoas = false;
                this.cardDetalhePessoa = false;
                this.cardOpcoesAjudante = false;
                this.criarAjuda = true;
                break;
                
            default:
                this.botoesIniciais = true;
                this.cardListaPessoas = false;
                this.cardDetalhePessoa = false;
                this.cardOpcoesAjudante = false;
                break;
        }
    }
}