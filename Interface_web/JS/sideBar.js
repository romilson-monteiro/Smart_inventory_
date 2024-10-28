// Função para carregar a sidebar
function loadSidebar() {
    // HTML da sidebar
    const sidebarHTML = `
        <div class="sidebar-header">
                <img src="../img/logo.png" alt="Logo">
                <span class="title">Smart Inventory</span>
            </div>
            <ul class="menu">
                <span class="menu-title">Main Menu</span>
                <li class="menu_buttons" id="li_dashboard"><a href="dashboard.html"><i
                            class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                <li class="menu_buttons" id="li_users"><a href="users.html"><i class="fas fa-user"></i> Utilizadores</a>
                </li>
                <li class="menu_buttons " id="li_assets"><a href="assets.html"><i class="fas fa-box"></i>
                        Ativos </a></li>
                <li class="menu_buttons" id="li_categories"><a href="categories.html"><i class="fas fa-boxes"></i>
                        Categorias</a></li>

                <li class="menu_buttons" id="li_movements"><a href="movements.html"><i class="fas fa-exchange-alt"></i>
                        Movimentos</a></li>
                <li class="menu_buttons" id="li_locations"><a href="location.html"><i class="fas fa-map-marker"></i>
                        Localizações</a>
                <li class="menu_buttons" id="li_reports"><a href="reports.html"><i class="fas fa-chart-line"></i>
                        Relatórios</a></li>
                <li class="menu_buttons" id="li_notifications"><a href="notifications.html"><i class="fas fa-bell"></i>
                        Notificações</a></li>

            </ul>



            <div class="sidebar-footer">
                <button class="logout-button" id="logout-button">Logout <i class="fas fa-sign-out-alt"></i></button>
            </div>
    `;

    // Adiciona a sidebar ao body da página
    const sidebarContainer = document.querySelector(".sidebar");
    sidebarContainer.innerHTML += sidebarHTML

    // Obtém o caminho atual da URL
    const currentPath = window.location.pathname.split('/').pop(); // Obtém o nome do arquivo atual

    // Seleciona todos os itens do menu
    const menuItems = document.querySelectorAll('.menu_buttons');

    // Itera sobre os itens do menu e adiciona a classe 'ativo' ao item correspondente
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href');

        if (href === currentPath) {
            item.classList.add('ativo'); // Adiciona a classe 'ativo'
        }
    });
}

function logout() {
    localStorage.removeItem("token");
    //limpar user
    localStorage.removeItem("user");
    window.location.href = "../HTML/login.html";


}

// Carrega a sidebar quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar()
    // Adiciona o ouvinte de evento ao botão de logout
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    } else {
        console.error("Logout button not found.");
    }
});
