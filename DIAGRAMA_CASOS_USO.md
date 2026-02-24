# Diagrama de Casos de Uso - GESA Cloud
**Estado de Goiás - SES/SUBIPEI**

Este diagrama descreve as funcionalidades do sistema sob a perspectiva dos diferentes perfis de usuários (Atores).

```mermaid
useCaseDiagram
    actor "Super Admin" as SA
    actor "Administrador" as AD
    actor "Operador GESA" as OP
    actor "Auditor" as AU
    actor "Consultor" as VI

    package "GESA Cloud System" {
        usecase "Autenticação Segura (MFA)" as UC1
        usecase "Visualizar Cockpit (KPIs)" as UC2
        usecase "Gerenciar Emendas (CRUD)" as UC3
        usecase "Tramitar Processo SEI" as UC4
        usecase "Análise de Conformidade (IA)" as UC5
        usecase "Gerar Dossiê Digital (PDF)" as UC6
        usecase "Configurar SLAs e Setores" as UC7
        usecase "Gerenciar Usuários (RBAC)" as UC8
        usecase "Consultar Trilhas de Auditoria" as UC9
        usecase "Acessar Portal de API" as UC10
        usecase "Visualizar Documentação" as UC11
    }

    %% Relacionamentos de Acesso
    VI --> UC1
    VI --> UC2
    VI --> UC11

    AU --> UC1
    AU --> UC2
    AU --> UC6
    AU --> UC9
    AU --> UC11

    OP --> UC1
    OP --> UC2
    OP --> UC3
    OP --> UC4
    OP --> UC5
    OP --> UC6

    AD --> UC1
    AD --> UC2
    AD --> UC3
    AD --> UC4
    AD --> UC7
    AD --> UC8
    AD --> UC10

    SA --> UC1
    SA --> UC7
    SA --> UC8
    SA --> UC9
    SA --> UC10
    
    %% Inclusões e Extensões
    UC3 <.. UC5 : <<extend>> (Análise IA)
    UC4 ..> UC9 : <<include>> (Log de Auditoria)
```

## Descrição dos Atores e Casos de Uso

### Atores
1.  **Super Admin**: Responsável pela infraestrutura global, segurança e governança de dados.
2.  **Administrador**: Gestor da unidade (SES, SEDUC, etc.), focado em configuração de fluxo e gestão de equipe.
3.  **Operador GESA**: Usuário técnico que realiza a carga de dados e a tramitação diária dos processos.
4.  **Auditor**: Perfil de controle com acesso a trilhas imutáveis e relatórios de conformidade.
5.  **Consultor (Viewer)**: Acesso de leitura para acompanhamento de prazos e status.

### Casos de Uso Principais
-   **UC4 - Tramitar Processo SEI**: Permite mover um processo entre unidades técnicas, disparando o cálculo de SLA e registrando a movimentação na trilha histórica.
-   **UC5 - Análise de Conformidade (IA)**: Utiliza o motor Gemini Pro para identificar riscos e gargalos no processo baseando-se no Decreto 10.634/2025.
-   **UC9 - Consultar Trilhas de Auditoria**: Visualização detalhada de cada ação realizada no sistema, garantindo transparência e conformidade jurídica.

---
**Instruções de Visualização:**
Este diagrama utiliza a sintaxe Mermaid. Você pode visualizar a renderização gráfica no [Mermaid Live Editor](https://mermaid.live/) ou imprimir este documento como PDF.
