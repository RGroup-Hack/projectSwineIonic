export class StateControl {
    private botoesIniciais: Boolean;
    public get isBotoesIniciais() : Boolean
    {
        return this.botoesIniciais;
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
    }

    setState(state: String) {
        switch (state) {
            case "queroAjudar":
                this.botoesIniciais = false;
                this.cardListaPessoas = true;
                this.cardDetalhePessoa = false;
                this.cardOpcoesAjudante = false;
                break;
            case "detalheAjuda":
                this.botoesIniciais = false;
                this.cardListaPessoas = false;
                this.cardDetalhePessoa = true;
                this.cardOpcoesAjudante = false;
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