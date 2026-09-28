# FLOATER — Plan de trabajo del sitio

Este documento es la guía de referencia para seguir armando el sitio sin roces: cómo vamos a trabajar juntos, cómo está pensada la navegación, y qué reglas técnicas seguimos desde ahora para no tener que rehacer cosas más adelante.

## 1. Cómo vamos a trabajar

Metodología simple, de a pasos:

1. Vos me mandás una foto por acá.
2. Yo te pregunto (si no está claro) para qué sección es: ¿fondo de landing, producto X frente/espalda, categoría Hombres, banner de ofertas, etc.?
3. La acomodo en el lugar técnico que corresponde y la conecto al botón/sección correspondiente.
4. Si hace falta un botón nuevo que lleve a un lugar que todavía no existe, lo creamos como página simple ("Próximamente") y la vamos completando con contenido real cuando lo tengas.
5. Repetimos, sumando secciones de a una — sin necesidad de tener todo el catálogo definido de entrada.

No hace falta que me digas rutas de carpetas en tu compu: subís la foto acá y yo me encargo del resto.

## 2. Mapa de navegación (vivo, va a ir creciendo)

```
Landing (foto de fondo)
 ├── Catálogo
 │     └── Ficha de producto (frente/espalda, talles, precio)
 ├── Ofertas          [placeholder]
 ├── Nuevos productos [placeholder]
 ├── (a futuro) Hombres
 ├── (a futuro) Mujeres
 ├── Carrito
 └── Checkout (simulado por ahora)
```

Cada botón nuevo que agreguemos en la landing va a un lugar real (aunque sea un placeholder al principio, nunca un link roto).

## 3. Reglas técnicas para prevenir problemas futuros

Estas son decisiones ya tomadas para que el sitio escale sin dolores de cabeza:

**Estructura de archivos y nombres**
Cada producto vive en su propia carpeta con nombre simple, sin espacios ni tildes: `assets/products/producto-1/frente.jpg`, `espalda.jpg`. Cuando sumemos más categorías (Hombres/Mujeres), se ordenan como subcarpetas del mismo estilo. Nombres de archivo predecibles = nada se rompe cuando agregamos productos nuevos.

**Fotos**
Para que el sitio se vea prolijo y cargue rápido, pido lo siguiente en cada foto que mandes:
- Formato JPG o PNG.
- Buena resolución (mínimo ~1200px en el lado más chico), pero no hace falta que sea un archivo gigante — si pesa mucho, yo la optimizo antes de subirla al sitio.
- Aclarame si es foto de producto (frente/espalda/detalle), foto de fondo/ambiente, o banner de una sección.

**Catálogo centralizado, no hardcodeado**
Los datos de cada producto (nombre, precio, talles, descripción, material) están en un solo lugar del código (`js/script.js`, array `PRODUCTS`). Cuando el catálogo crezca, lo vamos a pasar a un archivo de datos separado (`products.json`) para que agregar un producto sea simplemente sumar un bloque de datos, sin tocar el diseño ni la lógica del sitio.

**Mobile-first**
La mayoría de las compras de streetwear se hacen desde el celular. Todo lo que armamos se prueba y se ve bien en mobile antes que nada — el sitio ya está armado responsive desde la base.

**Rendimiento**
Imágenes optimizadas (comprimidas sin perder calidad visual) y carga progresiva, para que el sitio no se sienta lento aunque el catálogo crezca.

**SEO básico**
Cada página va a tener su propio título y descripción, y cada imagen su texto alternativo (alt), para que Google pueda indexar bien el sitio cuando esté online.

**Carrito y checkout (estado actual y límites)**
- El carrito hoy se guarda en el navegador del usuario (localStorage): funciona perfecto para probar el flujo, pero no se sincroniza entre dispositivos ni persiste si el usuario borra datos del navegador. Está bien para esta etapa de prototipo.
- El checkout hoy es simulado: no cobra nada real. Cuando definamos el medio de pago (Mercado Pago, Stripe u otro, según tu país), ahí conectamos el cobro real — eso va a requerir sitio publicado en un dominio propio con HTTPS (estándar, no es nada extra que tengamos que prever ahora).

**Dominio y hosting**
El sitio está armado como archivos estáticos (HTML/CSS/JS), lo que significa que se puede publicar en cualquier hosting (Netlify, Vercel, hosting tradicional, etc.) sin reescribir nada cuando llegue el momento.

**Copias de seguridad**
A medida que avanzamos, cada versión funcional queda guardada — así si algo se rompe en un cambio, podemos volver atrás sin perder trabajo.

**Legal mínimo (para más adelante, antes de vender de verdad)**
Página de contacto, política de cambios/devoluciones y términos básicos — no bloquea nada del desarrollo actual, pero lo dejamos anotado para no olvidarlo antes de lanzar con pagos reales.

## 4. Qué falta definir (lo vamos resolviendo de a uno, sin apuro)

- Fotos y datos (nombre, precio, talles, material) de los productos que ya tenés.
- Si sumamos categorías Hombres/Mujeres ahora o más adelante.
- Método de pago real (Mercado Pago / Stripe / otro) según tu país.
- Nombre de dominio y dónde publicar el sitio cuando esté listo.

---

*Este documento se puede actualizar a medida que el sitio crece — no hace falta rehacerlo, solo sumarle secciones.*
