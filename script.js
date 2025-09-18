// script.js

// 1. Cargar contenido del CMS (desde content/about/index.md)
async function loadCMSContent() {
  const contentDiv = document.getElementById('about-content');

  // Indicador visible: muestra que está cargando
  contentDiv.innerHTML = '<p class="text-center text-gray-500">Cargando contenido...</p>';

  try {
    // Ruta relativa: funciona en la mayoría de servidores locales
    const mdPath = './content/about/index.md';

    // Advertencia si se abre con file:// (solo informativa)
    if (location.protocol === 'file:') {
      console.warn('⚠️ Estás usando file:// — se recomienda usar un servidor local (Live Server, Python, etc).');
    }

    console.info(`Intentando cargar Markdown desde: ${mdPath}`);

    // Fetch del archivo
    const response = await fetch(mdPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const markdown = await response.text();

    // Si el archivo está vacío
    if (!markdown.trim()) {
      throw new Error("El archivo está vacío");
    }

    // Conversión básica de Markdown a HTML
    let html = markdown
      // Eliminar frontmatter (--- título ---)
      .replace(/---[\s\S]*?---/g, '')
      // Títulos
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mt-10 mb-4">$1</h1>')
      // Negritas y cursivas
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700">$1</blockquote>')
      // Enlaces
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      // Convertir saltos de línea dobles en párrafos
      .replace(/\n\n+/g, '</p><p class="my-4 leading-relaxed">')
      // Convertir saltos de línea simples en <br> solo si no están dentro de etiquetas
      .replace(/\n(?![^<]*>)/g, '<br>')
      // Asegurar que el contenido esté envuelto en párrafos si no tiene etiquetas
      .replace(/^(?![\s\S]*<\/(h[1-6]|blockquote|strong|em|a)>)/, '<p class="my-4 leading-relaxed">')
      .replace(/$/, '</p>');

    // Si no hay etiquetas HTML, envolver en párrafo
    if (!/<(h[1-6]|blockquote|strong|em|a|p)/.test(html)) {
      html = `<p class="my-4 leading-relaxed">${html}</p>`;
    }

    contentDiv.innerHTML = html;

  } catch (error) {
    console.error("❌ Error cargando contenido:", error);
    contentDiv.innerHTML = `
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
        <p class="font-bold">⚠️ Contenido no disponible</p>
        <p>Intenta editar el archivo: <code>content/about/index.md</code></p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// 2. Cargar repositorios de GitHub
async function loadGitHubRepos() {
  const username = "LUBEN09"; // 
  const container = document.getElementById('projects-list');

  try {
    // ❗¡CORREGIDO! Eliminado el espacio extra después de /users/
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const repos = await response.json();

    if (repos.length === 0) {
      container.innerHTML = "<p class='text-center'>Este usuario no tiene repos públicos.</p>";
      return;
    }

    container.innerHTML = repos
      .filter(repo => !repo.fork) // excluye forks
      .map(repo => `
        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border">
          <h3 class="text-xl font-bold text-blue-600">${repo.name}</h3>
          <p class="mt-2 text-gray-700">${repo.description || "Sin descripción"}</p>
          <div class="mt-4 flex justify-between text-sm text-gray-500">
            <span>⭐ ${repo.stargazers_count || 0}</span>
            <a href="${repo.html_url}" target="_blank" class="text-blue-500 hover:underline">Ver en GitHub</a>
          </div>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error("Error cargando repos:", error);
    container.innerHTML = `
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p class="font-bold">❌ Error al cargar proyectos</p>
        <p>Usuario: ${username}</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// 3. Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
  loadCMSContent();
  loadGitHubRepos();
});