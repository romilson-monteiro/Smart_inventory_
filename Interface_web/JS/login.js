
import { ip } from './config/config.js';


document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "../HTML/dashboard.html";
  }

  const btnLogin = document.getElementById("btnLogin");
  btnLogin.addEventListener("click", () => {
      const email = document.querySelector("#username").value;
      const password = document.querySelector("#password").value;
      const error_message = document.querySelector(".form-error");
  
      console.log(email, password)
      // Replace with the URL of the login endpoint
      const url = `http://${ip}:4242/api/user/userlogin`;
      

      const data = { email, password };
    
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro no login: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const token = data.token;
    
        localStorage.setItem("token", token);
        //save user info
        localStorage.setItem("user", JSON.stringify(data.user));  
        console.log(token);  
        error_message.style.display = "none";
        // Redirect to the restricted access page
      window.location.href = "../HTML/dashboard.html";
      
      })
      .catch((error) => {
        console.error(error.message);
        error_message.innerHTML += `<p color="red"> Credenciais inválidas. Tente novamente</p>`
      });
  });

});
