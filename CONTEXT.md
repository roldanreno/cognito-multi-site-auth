# Contexto de la Conversación

## Fecha
2 - 3 de Diciembre, 2025

## Requerimientos Iniciales

1. **Páginas estáticas en S3** - No hay framework, solo HTML puro
2. **Persistencia de sesión** - Mantener sesión al cerrar navegador
3. **Múltiples sitios** - Dos sitios con el mismo User Pool
4. **Diferente branding** - Cada sitio con su propio look and feel
5. **Control de pagos** - Un sitio gratis, otro de pago con Stripe
6. **Una sola sesión activa** - Limitar a una sesión por usuario

---

## Temas Discutidos

### 1. Manejo de JWT de Cognito

Cognito devuelve 3 tokens:
- **ID Token**: Información del usuario (5 min - 1 día)
- **Access Token**: Autorización de operaciones (5 min - 1 día)  
- **Refresh Token**: Renovar otros tokens (60 min - 10 años, default 30 días)

**Solución:** Usar `localStorage` para persistir los tokens.

### 2. Hosted UI vs Managed Login

Ambos usan el mismo flujo OAuth 2.0:
- `/login` - Página de autenticación
- `/oauth2/token` - Intercambio de tokens
- `/oauth2/revoke` - Revocación de tokens

### 3. Múltiples Sitios con Diferente Branding

**Seleccionado:** Múltiples App Clients con diferente branding

Cada App Client puede tener su propio estilo y callback URLs.

### 4. Control de Acceso por Pago

**Seleccionado:** Grupos de Cognito (`paid_users`)

Flujo:
```
Login → Verificar grupo → ¿paid_users? → Sí: Acceso / No: Stripe Checkout
Stripe Webhook → Lambda → AdminAddUserToGroup
```

### 5. Limitar Sesiones Simultáneas

**Seleccionado:** Refresh Token Rotation con grace period 0

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_xxxxx \
  --client-id tu_client_id \
  --refresh-token-rotation "FeatureStatus=ENABLED,RetryGracePeriodSeconds=0"
```

**Nota:** Requiere tier Essentials o Plus de Cognito.

---

## Decisiones Finales

| Aspecto | Decisión |
|---------|----------|
| Almacenamiento de tokens | localStorage |
| UI de login | Hosted UI |
| Multi-sitio | Múltiples App Clients |
| Control de pagos | Grupos de Cognito + Stripe |
| Límite de sesiones | Refresh Token Rotation |
| Grace period | 0 segundos |

---

## Próximos Pasos

1. [ ] Crear User Pool en Cognito
2. [ ] Configurar dominio de Hosted UI
3. [ ] Crear App Client A (sitio gratis)
4. [ ] Crear App Client B (sitio pago)
5. [ ] Habilitar Refresh Token Rotation en ambos
6. [ ] Crear grupo `paid_users`
7. [ ] Configurar branding para cada App Client
8. [ ] Desplegar archivos HTML en S3
9. [ ] Configurar Stripe y crear Lambda webhook
10. [ ] Probar flujo completo

---

## Referencias

- [Understanding user pool JSON web tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)
- [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)
- [Apply branding to managed login pages](https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-branding.html)
- [Token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)
