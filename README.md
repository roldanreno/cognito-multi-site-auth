# Cognito Multi-Site Authentication

Sistema de autenticación con Amazon Cognito para múltiples sitios estáticos en S3, con soporte para suscripciones de pago mediante Stripe.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cognito User Pool                     │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │   App Client A      │       │      App Client B           │  │
│  │   (Sitio Gratis)    │       │      (Sitio Pago)           │  │
│  └─────────────────────┘       └─────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Grupo: paid_users                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ Sitio A │          │ Sitio B │          │ Stripe  │
   │ (S3)    │          │ (S3)    │          │ Webhook │
   │ Gratis  │          │ Pago    │          │ (Lambda)│
   └─────────┘          └─────────┘          └─────────┘
```

## Características

- ✅ Login con Cognito Hosted UI
- ✅ Persistencia de sesión con localStorage
- ✅ Refresh Token Rotation (una sola sesión activa)
- ✅ Múltiples sitios con diferente branding
- ✅ Control de acceso por suscripción (Stripe)
- ✅ Mismo User Pool para todos los sitios

## Estructura del Proyecto

```
cognito-multi-site-auth/
├── README.md                    # Este archivo
├── CONTEXT.md                   # Contexto de la conversación
├── frontend/
│   ├── shared/
│   │   └── auth.js              # Lógica de autenticación compartida
│   ├── site-a/                  # Sitio gratuito
│   │   ├── index.html
│   │   ├── callback.html
│   │   └── config.js
│   └── site-b/                  # Sitio de pago
│       ├── index.html
│       ├── callback.html
│       └── config.js
└── backend/
    └── stripe-webhook/
        └── index.js             # Lambda para webhook de Stripe
```

## Decisiones Técnicas

| Decisión | Opción Seleccionada | Alternativas Consideradas |
|----------|---------------------|---------------------------|
| Almacenamiento de tokens | localStorage | Cookies (requiere backend) |
| Control de sesiones | Refresh Token Rotation | GlobalSignOut, DynamoDB tracking |
| Multi-sitio branding | Múltiples App Clients | CSS por App Client |
| Control de pagos | Grupos de Cognito | Custom attributes |
| UI de login | Hosted UI | Managed Login, Custom UI |

## Configuración en AWS

### 1. User Pool
```bash
# Crear User Pool con Hosted UI habilitado
# Configurar dominio: tu-dominio.auth.us-east-1.amazoncognito.com
```

### 2. App Clients con Refresh Token Rotation
```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_xxxxx \
  --client-id tu_client_id \
  --refresh-token-rotation "FeatureStatus=ENABLED,RetryGracePeriodSeconds=0"
```

### 3. Grupo para usuarios de pago
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_xxxxx \
  --username usuario@email.com \
  --group-name paid_users
```

## Requisitos

- AWS Account con Cognito (tier Essentials o Plus para Refresh Token Rotation)
- Stripe Account (para pagos)
- Bucket S3 configurado para hosting estático
