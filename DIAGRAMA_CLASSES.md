# Diagrama de Classes - GESA Cloud
**Estado de Goiás - SES/SUBIPEI**

Este diagrama representa a estrutura de dados e as entidades principais do sistema GESA Cloud, conforme definido no arquivo `types.ts`.

```mermaid
classDiagram
    class User {
        +String id
        +String tenantId
        +String name
        +String email
        +Role role
        +String department
        +Boolean lgpdAccepted
        +Boolean mfaEnabled
    }

    class Amendment {
        +String id
        +String tenantId
        +String code
        +String seiNumber
        +Int year
        +AmendmentType type
        +String deputyName
        +String municipality
        +String beneficiaryUnit
        +String object
        +Float value
        +String status
        +String currentSector
        +DateTime createdAt
        +TransferMode transferMode
        +GNDType gnd
        +List~AmendmentMovement~ movements
    }

    class AmendmentMovement {
        +String id
        +String amendmentId
        +String fromSector
        +String toSector
        +DateTime dateIn
        +DateTime dateOut
        +DateTime deadline
        +Int daysSpent
        +String handledBy
        +String remarks
    }

    class SectorConfig {
        +String id
        +String tenantId
        +String name
        +Int defaultSlaDays
        +String analysisType
    }

    class StatusConfig {
        +String id
        +String tenantId
        +String name
        +String color
        +Boolean isFinal
    }

    class AuditLog {
        +String id
        +String tenantId
        +DateTime timestamp
        +String actorId
        +String actorName
        +AuditAction action
        +String details
        +String severity
    }

    class Role {
        <<enumeration>>
        SUPER_ADMIN
        ADMIN
        OPERATOR
        AUDITOR
        VIEWER
    }

    class AmendmentType {
        <<enumeration>>
        IMPOSITIVA
        GOIAS_CRESCIMENTO
        RECURSO_PROPRIO
        TRANSFERENCIA_ESPECIAL
    }

    class Status {
        <<enumeration>>
        DOCUMENT_ANALYSIS
        TECHNICAL_FLOW
        DILIGENCE
        LEGAL_OPINION
        COMMITMENT_LIQUIDATION
        CONCLUDED
        ARCHIVED
    }

    Amendment "1" -- "*" AmendmentMovement : contém
    User "1" -- "1" Role : possui
    Amendment "1" -- "1" AmendmentType : possui
    AuditLog "1" -- "1" AuditAction : registra
```

---

## Como gerar o PDF:
1. Abra este arquivo no visualizador do sistema.
2. Pressione **Ctrl + P** (ou Cmd + P no Mac).
3. Selecione a impressora **"Salvar como PDF"**.
4. Clique em **Salvar**.

*Nota: O diagrama acima utiliza a sintaxe Mermaid. Se o seu visualizador não renderizar o gráfico automaticamente, você pode copiar o código acima e colar no [Mermaid Live Editor](https://mermaid.live/) para exportar em alta resolução.*
