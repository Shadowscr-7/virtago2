import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Base de conocimiento completa de Virtago ────────────────────────────
const VIRTAGO_KNOWLEDGE = `
## SOBRE VIRTAGO
Virtago es una plataforma B2B de e-commerce multi-marca para negocios mayoristas. Permite a distribuidores vender productos a clientes empresariales con precios diferenciados, descuentos por volumen, y gestión integral del catálogo.

## TIPOS DE USUARIO
1. **Distribuidor (admin/distributor)**: Dueño de la tienda B2B. Gestiona productos, clientes, precios, descuentos, órdenes. Tiene acceso al panel de administración.
2. **Cliente (user/client)**: Comprador B2B. Navega el catálogo, hace pedidos, gestiona su perfil y favoritos.

## FUNCIONALIDADES PARA DISTRIBUIDORES (Panel Admin /admin)

### Dashboard (/admin)
- Vista general del negocio: ventas, pedidos, clientes activos, productos.
- Métricas y estadísticas en tiempo real.

### Configuración Rápida / Wizard (/admin/configuracion-rapida)
- Asistente paso a paso para configurar la tienda desde cero.
- Pasos: Clientes → Productos → Listas de Precios → Precios → Descuentos.
- Importación masiva por archivo (CSV, JSON, XLSX) o carga manual.
- Mapeo inteligente de columnas al importar archivos.
- Descarga de plantillas de ejemplo para cada entidad.

### Gestión de Clientes (/admin/clientes)
- CRUD completo: crear, editar, eliminar clientes.
- Importación masiva desde archivos.
- Asignación de listas de precios y descuentos a cada cliente.
- Campos: nombre, email, teléfono, dirección, RUC/documento, tipo de negocio.

### Gestión de Productos (/admin/productos)
- CRUD completo: crear, editar, eliminar productos.
- Importación masiva desde archivos.
- Campos: nombre, SKU, descripción, precio base, categoría, marca, stock, peso.
- Imágenes con IA (Cloudinary + AI Vision): análisis automático de imágenes, sugerencias de mejora, categorización.

### Gestión de Imágenes (/admin/imagenes)
- Subida de imágenes a Cloudinary.
- IA Vision para análisis de producto por imagen.
- Asociación automática de imágenes a productos.

### Listas de Precios (/admin/listas-precios)
- Múltiples listas (ej: Mayorista, Minorista, VIP, Distribuidor).
- Cada lista tiene su moneda, prioridad, fecha de vigencia.
- Importación masiva.
- Asignación de listas a clientes específicos.

### Precios (/admin/precios)
- Definir precio específico por producto + lista de precios.
- Importación masiva.
- Precio base, precio con descuento, márgenes.

### Descuentos (/admin/descuentos)
- Sistema de descuentos con templates predefinidos.
- 12 tipos de templates: por cantidad, por monto, escalonado, por categoría, por marca, primera compra, por volumen, por producto, por cliente, bundle, temporal, fidelidad.
- Condiciones configurables: mínimos de compra, rangos de fechas, productos/categorías aplicables.
- Importación masiva.

### Órdenes (/admin/ordenes)
- Ver todos los pedidos de clientes.
- Crear órdenes manualmente.
- Cambiar estado: pendiente, confirmado, en preparación, enviado, entregado, cancelado.
- Detalle de cada orden con productos, cantidades, precios, descuentos aplicados.

### Cupones (/admin/cupones)
- Crear códigos de cupón con descuento fijo o porcentual.
- Límite de usos, fechas de validez.
- Asignación a clientes o productos específicos.

### Tutoriales (/admin/tutoriales)
- Guías paso a paso para usar cada funcionalidad.
- Videos y documentación integrada.

### Tests E2E (/admin/tests)
- Herramienta para ejecutar tests automatizados de la plataforma.

## FUNCIONALIDADES PARA CLIENTES (Tienda)

### Catálogo de Productos (/productos)
- Navegar por categoría, marca, proveedor.
- Búsqueda con filtros avanzados (precio, marca, categoría, stock).
- Ver detalle de producto con imágenes, descripción, precios según su lista asignada.

### Detalle de Producto (/producto/[id])
- Imágenes, descripción completa, especificaciones.
- Precio según la lista de precios asignada al cliente.
- Descuentos aplicables visibles.
- Agregar al carrito con cantidad.

### Carrito y Checkout (/checkout)
- Carrito lateral con resumen de productos.
- Ver descuentos aplicados automáticamente.
- Aplicar cupones de descuento.
- Confirmar pedido con dirección de envío y método de pago.

### Mis Pedidos (/mis-pedidos)
- Historial de todos los pedidos.
- Estado de cada pedido en tiempo real.
- Detalle completo de cada orden.

### Favoritos (/favoritos)
- Lista de productos guardados.
- Acceso rápido para recompra.

### Marcas (/marcas)
- Explorar por marca.
- Ver todos los productos de una marca.

### Ofertas (/ofertas)
- Productos con descuentos activos.
- Promociones vigentes.

### Proveedores (/suppliers)
- Directorio de proveedores/marcas disponibles.

### Perfil (/perfil)
- Datos personales, información de empresa.
- Editar información de contacto.

### Configuración (/configuracion)
- Métodos de pago (/configuracion/metodos-pago)
- Direcciones de envío (/configuracion/direcciones-envio)
- Autenticación 2FA (/configuracion/autenticacion-2fa)
- Cambiar contraseña (/configuracion/cambiar-contrasena)

### Temas (/themes)
- Personalizar la apariencia de la tienda.
- Múltiples temas disponibles.

## REGISTRO Y ONBOARDING
- Registro multi-paso: datos básicos → verificación OTP por email → selección tipo de usuario → info personal → info de negocio (si distribuidor) → selección de plan.
- Planes: Free, Basic, Pro, Enterprise con diferentes límites de productos, clientes, almacenamiento.

## CONTACTO (/contacto)
- Formulario de contacto.
- Soporte por email: soporte@virtago.com.

## TECNOLOGÍA
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion.
- Backend API REST conectada.
- Imágenes: Cloudinary con IA.
- Chat IA integrado para asistencia.
`;

// ── Función para construir el system prompt según contexto ──────────────
function buildSystemPrompt(
  userContext?: { firstName?: string; userType?: string; role?: string; plan?: string; hasDistributorInfo?: boolean; businessName?: string } | null,
  errorContext?: { error?: Record<string, unknown>; analysis?: Record<string, unknown> } | null,
): string {
  const isDistributor = userContext?.role === 'distributor' || userContext?.role === 'admin' || userContext?.userType === 'distributor';
  const isClient = userContext?.userType === 'client' && userContext?.role === 'user';
  const userName = userContext?.firstName || '';

  let prompt = `Eres el asistente IA de Virtago, una plataforma B2B de e-commerce.
Respondes SIEMPRE en español, de forma concisa, amigable y útil (máx 5-6 oraciones).
Usa formato Markdown ligero cuando sea útil (negritas, listas).

${VIRTAGO_KNOWLEDGE}
`;

  // Contexto del usuario
  if (userContext) {
    prompt += `\n--- USUARIO CONECTADO ---\n`;
    if (userName) prompt += `Nombre: ${userName}\n`;
    prompt += `Tipo: ${isDistributor ? 'Distribuidor/Admin' : isClient ? 'Cliente/Comprador' : userContext.userType || 'desconocido'}\n`;
    prompt += `Rol: ${userContext.role || 'user'}\n`;
    prompt += `Plan: ${userContext.plan || 'free'}\n`;
    if (userContext.businessName) prompt += `Empresa: ${userContext.businessName}\n`;

    if (isDistributor) {
      prompt += `\nEste usuario es un DISTRIBUIDOR. Puede gestionar productos, clientes, precios, listas de precios, descuentos, órdenes y cupones desde el panel de administración (/admin). Ayúdalo con tareas de gestión de su tienda B2B. Si te pregunta por funciones de la tienda, guíalo al panel admin correspondiente.\n`;
    } else if (isClient) {
      prompt += `\nEste usuario es un CLIENTE/COMPRADOR. Navega productos, hace pedidos, gestiona favoritos y su perfil. NO tiene acceso al panel de administración. Ayúdalo con compras, buscar productos, ver pedidos, cupones, etc.\n`;
    }
  } else {
    prompt += `\nEl usuario no está autenticado o no se pudo determinar su tipo. Responde de forma general y sugiere que inicie sesión si necesita funciones específicas.\n`;
  }

  // Contexto de error
  if (errorContext?.error || errorContext?.analysis) {
    const err = errorContext.error as Record<string, unknown> | undefined;
    const analysis = errorContext.analysis as Record<string, unknown> | undefined;
    const errObj = err?.error as Record<string, string> | undefined;
    const reqObj = err?.request as Record<string, string> | undefined;
    const resObj = err?.response as Record<string, unknown> | undefined;

    prompt += `\n--- CONTEXTO DE ERROR RECIENTE ---\n`;
    prompt += `El usuario acaba de experimentar un error. Tu trabajo AHORA es ayudarle con ese error específico.\n`;
    prompt += `Error: ${errObj?.message || 'desconocido'}\n`;
    prompt += `Fuente: ${(err?.source as string) || 'desconocida'}\n`;

    if (reqObj) {
      prompt += `Request: ${reqObj.method} ${reqObj.url}\n`;
    }
    if (resObj) {
      prompt += `Response status: ${resObj.status}\n`;
      if (resObj.data) {
        prompt += `Response data: ${JSON.stringify(resObj.data).slice(0, 500)}\n`;
      }
    }

    if (analysis) {
      prompt += `\nAnálisis previo:\n`;
      prompt += `- Causa: ${analysis.cause}\n`;
      prompt += `- Solución: ${analysis.solution}\n`;
      prompt += `- Severidad: ${analysis.severity}\n`;
      prompt += `- Categoría: ${analysis.category}\n`;
      if (analysis.code_suggestion) {
        prompt += `- Código sugerido: ${analysis.code_suggestion}\n`;
      }
    }

    prompt += `\nResponde ESPECÍFICAMENTE sobre este error. Da pasos concretos. No des respuestas genéricas.\n`;
  }

  return prompt;
}

/**
 * POST /api/ai/chat
 *
 * Chat conversacional con contexto completo de Virtago.
 * Sabe quién es el usuario (distribuidor o cliente), qué puede hacer,
 * y si hay un error reciente lo analiza en contexto.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,        // string — lo que escribió el usuario
      errorContext,    // { error, analysis } | null
      history,         // { role: 'user'|'ai', content: string }[]
      userContext,     // { firstName, userType, role, plan, ... } | null
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Falta el mensaje' },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // ── Con OpenAI ────────────────────────────────────────────────────
    if (apiKey) {
      try {
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey });

        const systemPrompt = buildSystemPrompt(userContext, errorContext);

        // Construir historial de mensajes
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: systemPrompt },
        ];

        // Agregar historial reciente (últimos 6 mensajes)
        if (history && Array.isArray(history)) {
          for (const msg of history.slice(-6)) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
            });
          }
        }

        // Agregar mensaje actual
        messages.push({ role: 'user', content: message });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.4,
          max_tokens: 600,
        });

        const reply = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';

        return NextResponse.json({
          success: true,
          reply,
          provider: 'openai',
        });
      } catch (aiError) {
        console.error('[AI Chat] OpenAI failed:', aiError);
        // Fall through to static response
      }
    }

    // ── Sin API key → respuesta estática inteligente ──────────────────
    const reply = generateStaticResponse(message, errorContext, userContext);

    return NextResponse.json({
      success: true,
      reply,
      provider: 'static',
    });
  } catch (err) {
    console.error('[AI Chat] Error:', err);
    return NextResponse.json(
      { error: 'Error interno del chat IA' },
      { status: 500 },
    );
  }
}

/**
 * Genera una respuesta estática cuando no hay API key de OpenAI.
 */
function generateStaticResponse(
  message: string,
  errorContext?: { error?: Record<string, unknown>; analysis?: Record<string, unknown> } | null,
  userContext?: { firstName?: string; userType?: string; role?: string; plan?: string; businessName?: string } | null,
): string {
  const msg = message.toLowerCase();
  const isDistributor = userContext?.role === 'distributor' || userContext?.role === 'admin' || userContext?.userType === 'distributor';
  const name = userContext?.firstName ? `, ${userContext.firstName}` : '';

  // Si hay contexto de error, responder acorde
  if (errorContext?.analysis) {
    const analysis = errorContext.analysis as {
      cause?: string;
      solution?: string;
      severity?: string;
      code_suggestion?: string;
    };

    if (msg.includes('solucion') || msg.includes('soluciono') || msg.includes('arregl') || msg.includes('fix')) {
      return `Para solucionar este error, te recomiendo:\n\n${analysis.solution || 'Revisa los detalles técnicos del error para más información.'}\n\n${analysis.code_suggestion ? `También puedes probar: ${analysis.code_suggestion}` : '¿Necesitas más detalles sobre algún paso específico?'}`;
    }

    if (msg.includes('grave') || msg.includes('serio') || msg.includes('importa') || msg.includes('severidad')) {
      const severityMap: Record<string, string> = {
        critical: 'Este es un error **crítico** que bloquea funcionalidad importante. Debería resolverse lo antes posible.',
        medium: 'Este es un error de **severidad media**. No bloquea el sistema pero afecta la experiencia. Conviene resolverlo pronto.',
        low: 'Este es un error de **baja severidad**. Es menor y no afecta la funcionalidad principal.',
      };
      return severityMap[analysis.severity || 'medium'] || severityMap.medium;
    }

    if (msg.includes('detalle') || msg.includes('técnico') || msg.includes('explica') || msg.includes('más')) {
      return `Aquí va un análisis más detallado:\n\n**Causa raíz:** ${analysis.cause}\n\n**Solución recomendada:** ${analysis.solution}\n\n${analysis.code_suggestion ? `**Código sugerido:**\n${analysis.code_suggestion}` : ''}\n\n¿Hay algo más que necesites saber?`;
    }

    if (msg.includes('ignorar') || msg.includes('no importa')) {
      return 'Entendido, ignoraremos este error por ahora. Si vuelve a ocurrir, no dudes en preguntar. ¡Estoy aquí para ayudarte!';
    }

    return `Respecto al error (${analysis.cause?.slice(0, 60)}...):\n\n${analysis.solution}\n\n¿Te gustaría más detalles o necesitas ayuda con otra cosa?`;
  }

  // ── Respuestas contextuales según tipo de usuario ───────────────────

  // Saludos
  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey') || msg.includes('buenos')) {
    if (isDistributor) {
      return `¡Hola${name}! 👋 Soy el asistente IA de Virtago. Puedo ayudarte a gestionar tu tienda B2B: productos, clientes, precios, listas de precios, descuentos, órdenes y más. ¿En qué te puedo ayudar hoy?`;
    }
    return `¡Hola${name}! 👋 Soy el asistente de Virtago. Puedo ayudarte a encontrar productos, ver tus pedidos, aplicar cupones y más. ¿Qué necesitas?`;
  }

  // Productos
  if (msg.includes('producto') || msg.includes('inventario') || msg.includes('stock') || msg.includes('catálogo') || msg.includes('catalogo')) {
    if (isDistributor) {
      return 'Para gestionar productos, ve a **Administración → Productos** (/admin/productos). Puedes:\n\n- Crear productos manualmente\n- Importar masivamente desde CSV/JSON/XLSX\n- La IA categoriza automáticamente tus productos\n- Gestionar imágenes con IA Vision\n\n¿Te gustaría saber más sobre alguna de estas opciones?';
    }
    return 'Puedes explorar todo el catálogo en **Productos** (/productos). Usa los filtros para buscar por categoría, marca o rango de precios. También puedes ver las **Ofertas** (/ofertas) activas. ¿Buscas algo en particular?';
  }

  // Clientes
  if (msg.includes('cliente') || msg.includes('customer') || msg.includes('comprador')) {
    if (isDistributor) {
      return 'La gestión de clientes está en **Administración → Clientes** (/admin/clientes). Puedes:\n\n- Crear clientes manualmente\n- Importar masivamente desde archivos\n- Asignar listas de precios y descuentos a cada cliente\n\nTambién puedes usar el **Wizard** (/admin/configuracion-rapida) para configuración rápida.';
    }
    return 'Tu información de perfil y configuración están en **Mi Perfil** (/perfil) y **Configuración** (/configuracion). Ahí puedes editar tus datos, direcciones de envío y métodos de pago.';
  }

  // Precios
  if (msg.includes('precio') || msg.includes('lista') || msg.includes('tarifa')) {
    if (isDistributor) {
      return 'El sistema de precios de Virtago tiene dos partes:\n\n1. **Listas de Precios** (/admin/listas-precios): Crea listas como Mayorista, Minorista, VIP\n2. **Precios** (/admin/precios): Define precio por producto + lista\n\nPuedes importar ambos masivamente. ¿Quieres ayuda configurando alguna?';
    }
    return 'Los precios que ves en la tienda ya están ajustados según tu lista de precios asignada. Si crees que hay un error en un precio, contacta al distribuidor.';
  }

  // Descuentos
  if (msg.includes('descuento') || msg.includes('promocion') || msg.includes('promoción') || msg.includes('oferta')) {
    if (isDistributor) {
      return 'Los descuentos se gestionan en **Administración → Descuentos** (/admin/descuentos). Hay 12 templates disponibles:\n\n- Por cantidad, monto, escalonado\n- Por categoría, marca, producto\n- Primera compra, fidelidad, temporal\n- Bundle, volumen, por cliente\n\n¿Quieres crear uno?';
    }
    return 'Puedes ver las ofertas activas en **Ofertas** (/ofertas). Si tienes un cupón de descuento, puedes aplicarlo en el checkout. ¿Tienes un código de cupón?';
  }

  // Órdenes / Pedidos
  if (msg.includes('orden') || msg.includes('pedido') || msg.includes('compra') || msg.includes('envío') || msg.includes('envio')) {
    if (isDistributor) {
      return 'Gestiona las órdenes en **Administración → Órdenes** (/admin/ordenes). Puedes:\n\n- Ver todas las órdenes de tus clientes\n- Cambiar estados (pendiente → confirmado → enviado → entregado)\n- Crear órdenes manualmente\n\n¿Necesitas ayuda con algún pedido?';
    }
    return 'Tus pedidos están en **Mis Pedidos** (/mis-pedidos). Ahí puedes ver el estado de cada orden y su detalle completo. ¿Tienes alguna consulta sobre un pedido específico?';
  }

  // Cupones
  if (msg.includes('cupón') || msg.includes('cupon') || msg.includes('código') || msg.includes('codigo')) {
    if (isDistributor) {
      return 'Crea cupones en **Administración → Cupones** (/admin/cupones). Puedes configurar descuento fijo o porcentual, límite de usos, fechas de validez y a qué clientes/productos aplica.';
    }
    return 'Si tienes un código de cupón, puedes aplicarlo durante el checkout. El descuento se aplicará automáticamente a tu pedido.';
  }

  // Wizard / Configuración rápida
  if (msg.includes('wizard') || msg.includes('configurar') || msg.includes('empezar') || msg.includes('setup') || msg.includes('configuración rápida')) {
    if (isDistributor) {
      return 'El **Wizard de Configuración Rápida** (/admin/configuracion-rapida) te guía paso a paso:\n\n1. 👥 Clientes → 2. 📦 Productos → 3. 📋 Listas de Precios → 4. 💰 Precios → 5. 🏷️ Descuentos\n\nPuedes importar datos masivamente o configurar manualmente. ¡Es la forma más rápida de empezar!';
    }
    return 'Si necesitas ayuda configurando tu cuenta, ve a **Configuración** (/configuracion) para ajustar tus datos, direcciones y métodos de pago.';
  }

  // Imágenes
  if (msg.includes('imagen') || msg.includes('foto') || msg.includes('cloudinary') || msg.includes('ia vision')) {
    if (isDistributor) {
      return 'La gestión de imágenes con IA está en **Administración → Imágenes** (/admin/imagenes). El sistema usa Cloudinary + AI Vision para:\n\n- Analizar automáticamente las imágenes de productos\n- Sugerir categorización\n- Optimizar calidad\n\n¿Quieres subir imágenes?';
    }
    return 'Las imágenes de los productos se muestran en su página de detalle. Si notas un problema con alguna imagen, contacta al distribuidor.';
  }

  // Favoritos
  if (msg.includes('favorito') || msg.includes('guardar') || msg.includes('wishlist')) {
    return 'Tus productos guardados están en **Favoritos** (/favoritos). Puedes agregar productos desde el catálogo haciendo clic en el ícono de corazón. ¡Es útil para recompras rápidas!';
  }

  // Perfil / Cuenta
  if (msg.includes('perfil') || msg.includes('cuenta') || msg.includes('datos') || msg.includes('contraseña')) {
    return 'Tu perfil está en **Mi Perfil** (/perfil). Para cambiar contraseña, ve a **Configuración → Cambiar Contraseña** (/configuracion/cambiar-contrasena). También puedes activar 2FA en **Configuración → Autenticación 2FA**.';
  }

  // Ayuda genérica
  if (msg.includes('ayuda') || msg.includes('help') || msg.includes('qué puedo') || msg.includes('que puedo') || msg.includes('funciones')) {
    if (isDistributor) {
      return `${name ? name.slice(2) + ', como' : 'Como'} distribuidor en Virtago puedes:\n\n📦 Gestionar productos e imágenes\n👥 Gestionar clientes\n💰 Configurar precios y listas de precios\n🏷️ Crear descuentos y cupones\n📋 Gestionar órdenes\n🚀 Usar el Wizard para configuración rápida\n\nTodo desde el **Panel Admin** (/admin). ¿Sobre qué quieres saber más?`;
    }
    return `${name ? name.slice(2) + ', en' : 'En'} Virtago puedes:\n\n🛍️ Explorar productos y marcas\n❤️ Guardar favoritos\n🛒 Hacer pedidos\n🏷️ Usar cupones de descuento\n📋 Ver historial de pedidos\n⚙️ Configurar tu perfil\n\n¿En qué te puedo ayudar?`;
  }

  // Default
  if (isDistributor) {
    return `Puedo ayudarte con la gestión de tu tienda B2B${name}: productos, clientes, precios, descuentos, órdenes, cupones e imágenes. También puedo guiarte con el Wizard de configuración rápida. ¿Sobre qué necesitas ayuda?`;
  }
  return `Puedo ayudarte${name} con la navegación de productos, tus pedidos, favoritos, cupones y configuración de tu cuenta. ¿Qué necesitas?`;
}
