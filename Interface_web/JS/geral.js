import { ip } from './config/config.js';

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", () => {
  logout();
});

function logout() {
    localStorage.removeItem("token");
    //limpar user
    localStorage.removeItem("user");
    window.location.href = "../HTML/login.html";


}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../HTML/login.html";
    }
    const userNameElement = document.querySelector(".user-name");
    const user = JSON.parse(localStorage.getItem("user"));
  
    // user exist
    if (user) {
        userNameElement.textContent = user.name;
    } else {
        window.location.href = "../HTML/login.html";
    }

    //validar token se nao espirou
    fetch(`http://${ip}:4242/api/validateToken`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })

        .then((response) => {
            if (!response.ok) {
                alert("Secção expirada");
                logout();
                throw new Error("Token inválido");
                
            }
            return response.json();
        }
        )
        .then((data) => {
            console.log("Bem-vindo");
        })
        .catch((error) => {
            console.log(error);
            logout();
            window.location.href = "../HTML/login.html";
        });
}

);

      
