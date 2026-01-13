# Reservas App

Aplicación de gestión de reservas de espacios diseñada para facilitar la administración y el uso de espacios compartidos.

## Características Principales

*   **Gestión de Espacios**: Visualización y detalle de espacios disponibles.
*   **Mis Reservas**: Sección para que los usuarios gestionen sus reservas actuales.
*   **Autenticación**: Sistema seguro de login y protección de rutas.
*   **Calendario**: Interfaz intuitiva para seleccionar fechas y horarios.

## Tecnologías Utilizadas

Este proyecto está construido con las últimas tecnologías web:

*   **Framework**: [Angular](https://angular.io/) (^19.2.0)
*   **UI Library**: [PrimeNG](https://primeng.org/) (^19.1.4)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (^4.1.18)
*   **Icons**: PrimeIcons

## Requisitos Previos

Asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (versión compatible con Angular 19)
*   [npm](https://www.npmjs.com/) (generalmente incluido con Node.js)
*   Angular CLI: `npm install -g @angular/cli`

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd reservas-app
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```

## Implementación y Uso

### Servidor de Desarrollo

Para iniciar el servidor de desarrollo, ejecuta:

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.

### Construcción (Build)

Para construir el proyecto (los artefactos de compilación se almacenarán en el directorio `dist/`):

```bash
ng build
```

### Tests

Para ejecutar las pruebas unitarias:

```bash
ng test
```
