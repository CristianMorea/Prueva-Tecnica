
#  API de Procesamiento de Texto

Una API REST completa para procesamiento de documentos que incluye detección de idioma, resumen automático y traducción de textos y archivos PDF/TXT usando modelos de Hugging Face.

## 🚀 Características

- Detección de Idioma: Identifica automáticamente el idioma de textos y documentos
- Resumen Automático: Genera resúmenes concisos de textos largos
- Traducción Multiidioma: Traduce textos y documentos entre múltiples idiomas
- Soporte de Archivos: Procesa archivos PDF y TXT
- Rate Limiting: Protección contra abuso con límites de solicitudes
- API RESTful: Endpoints bien estructurados con respuestas JSON
## 📁 Estructura del Proyecto


![estructuraProyect](![alt text](image.png))
## 🛠️ Tecnologías Utilizadas

- Node.js - Entorno de ejecución
- Express.js - Framework web
- Hugging Face - Modelos de IA para procesamiento de lenguaje natural
- Multer - Manejo de archivos multipart
- PDF-Parse - Extracción de texto de PDFs
- Helmet - Seguridad HTTP
- CORS - Manejo de CORS
- Express-rate-limit - Limitación de velocidad
## 📋 Pre-requisitos

- Node.js (v14 o superior)
- NPM o Yarn
- Token de API de Hugging Face
## ⚙️ Instalación

1. Clonar el repositorio 

- git clone <repository-url>
- cd api-procesamiento-texto

2. Instalar dependencias

- npm install
 
3. Crear un archivo .env en la raíz del proyecto:

## Hugging Face API
- HUGGINGFACE_API_KEY=tu_token_aqui

## Configuración del servidor
- PORT=10000
- NODE_ENV=development
- API_VERSION=1.0.0

## Para producción (Render)
- RENDER_EXTERNAL_URL=https://tu-app.onrender.com

4. Iniciar el servidor

- Desarrollo:

npm run dev
## 🎯 Idiomas Soportados

La API soporta traducción entre los siguientes idiomas:

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)
- 🇳🇱 Dutch (nl)
- 🇸🇪 Swedish (sv)
- 🇳🇴 Norwegian (no)
- 🇩🇰 Danish (da)
- 🇫🇮 Finnish (fi)
- 🇵🇱 Polish (pl)
- 🇹🇷 Turkish (tr)
- 🇮🇱 Hebrew (he)
## API Reference

#### GET traer los lenguajes disponibles

```http
   /api/v1/translation/languages
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `none` | `none` | trae todos los idiomas disponibles para la traduccion |

#### POST detectar lenguaje

```http
/api/v1/language/detect-language

```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file`      | `file` | **Required**. PDF o TXT para analizarlo |


#### POST Resumir el contenido del archivo

```http
  /api/v1/summarize
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file`      | `file` | **Required**. PDF o TXT para resumir |

#### add(num1, num2)

Takes two numbers and returns the sum.

#### POST traduccion

```http
  /api/v1/translation/file
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file`      | `file` | **Required**. PDF o TXT para resumir |
| `targetLanguage`      | `Text` | **Required**. clave de idioma a traducir |
| `sourceLanguage`      | `Text` | **Required**. idioma de origen o idioma detectado |



## 📄 Formatos de Archivo Soportados

- PDF (.pdf) - Extracción automática de texto
- TXT (.txt) - Archivos de texto plano

Límites:

- Tamaño máximo: 10MB por archivo
- Longitud máxima de texto: Procesamiento por chunks para textos largos
## 🔒 Seguridad y Límites

- Rate Limiting: 100 solicitudes por 15 minutos en producción
- CORS: Configurado para permitir solicitudes de cualquier origen
- Helmet: Headers de seguridad HTTP
- Validación de archivos: Solo PDF y TXT permitidos
- Límite de payload: 10MB máximo
## 🚀 Despliegue

Despliegue en Render

- Conectar el repositorio a Render
- Configurar las variables de entorno:

- HUGGINGFACE_API_KEY
- NODE_ENV=production


Render detectará automáticamente el comando de inicio
## 🐛 Manejo de Errores
La API incluye manejo robusto de errores:

- Validación de entrada
- Fallbacks para modelos de IA
- Detección de idioma de respaldo
- Logging detallado para debugging
- Respuestas de error consistentes
## 📝 Modelos de IA Utilizados
Detección de Idioma

- facebook/fasttext-language-identification
- Fallback con patrones de texto personalizados

Resumen de Texto

- sshleifer/distilbart-cnn-12-6

Traducción

- Helsinki-NLP/opus-mt-[lang1]-[lang2] (para pares específicos)
- Helsinki-NLP/opus-mt-mul-en (modelo multiidioma fallback)
## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

- Revisa la documentación
- Verifica que tu token de Hugging Face sea válido
- Consulta los logs del servidor para errores específicos
- Abre un issue en el repositorio