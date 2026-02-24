# Diagrama de Pacotes - GESA Cloud
**Estado de Goiás - SES/SUBIPEI**

Este diagrama ilustra a organização modular do sistema GESA Cloud e as dependências entre as diferentes camadas da aplicação.

```mermaid
subgraph "GESA Cloud System"
    direction TB

    subgraph "Root Package (Orquestração)"
        App[App.tsx]
        Types[types.ts]
        Constants[constants.ts]
        Index[index.tsx]
    end

    subgraph "Components Package (Interface UI/UX)"
        Layout[Layout.tsx]
        Dash[Dashboard.tsx]
        List[AmendmentList.tsx]
        Detail[AmendmentDetail.tsx]
        Security[SecurityModule.tsx]
        Audit[AuditModule.tsx]
        Reports[ReportModule.tsx]
        Modals[Modals & Widgets]
    end

    subgraph "Services Package (Infraestrutura & Cloud)"
        Supabase[supabase.ts]
        Gemini[geminiService.ts]
        API[apiService.ts]
    end

    subgraph "Context Package (Estado Global)"
        Notif[NotificationContext.tsx]
    end

    %% Dependências
    App ..> Layout : utiliza
    App ..> Components : orquestra
    App ..> Services : consome
    App ..> Context : provê/consome
    
    Components ..> Types : importa definições
    Components ..> Constants : importa dados estáticos
    Components ..> Context : consome notificações
    
    Services ..> Types : tipagem de retorno
    
    Detail ..> Gemini : solicita análise de IA
    Detail ..> Supabase : persiste trâmites
    
    List ..> Supabase : busca processos
    
    Security ..> Supabase : gerencia usuários
end
```

## Descrição dos Pacotes

1.  **Root Package**: Contém o ponto de entrada da aplicação e as definições globais (`types.ts`) que servem como o "contrato" de dados para todo o sistema.
2.  **Components Package**: Camada de apresentação. Os componentes são desacoplados da lógica de persistência direta, recebendo dados via props do `App.tsx`.
3.  **Services Package**: Gerencia a comunicação com serviços externos. O `supabase.ts` lida com o banco de dados e tempo real, enquanto o `geminiService.ts` encapsula a lógica de IA.
4.  **Context Package**: Fornece estados transversais que precisam estar disponíveis em qualquer lugar da árvore de componentes, como o sistema de notificações "Plush".

---
**Instruções de Visualização:**
Para exportar este diagrama, você pode utilizar o [Mermaid Live Editor](https://mermaid.live/) ou imprimir esta página como PDF.
