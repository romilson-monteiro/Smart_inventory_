export const sendWelcomeEmail = async (user, resetLink) => {
  const emailBody = `
    <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" integrity="sha512-6A9+uyZsOJjbk6I1vtrL00xnt7fA+rB/bvmBHtwZx6vrkdK7EGdVmFt34PMsTtxwa4vBCmcwyBUuN5blFOeC29A==" crossorigin="anonymous" />
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
          }

          .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: white;
          }

          .header {
            text-align: center;
            background-color: #004d99;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
          }

          .content {
            margin-top: 20px;
          }

          .footer {
            margin-top: 40px;
            font-size: 0.8em;
            text-align: center;
            color: #666;
          }

          .button {
            color: white;
            text-color: white;
            padding: 15px 30px;
            text-align: center;
            border-radius: 5px;
            display: inline-block;
            text-decoration: none;
            margin-top: 20px;
            transition: background-color 0.3s ease;
            cursor: pointer;
          }

          .button i {
            margin-right: 10px;
          }

          .button a {
            color: white;
            text-decoration: none;
          }

          .reset-password-button {
            background-color: #ff0000;
          }

          .reset-password-button:hover {
            background-color: #a52a35;
          }

          .download-app-button {
            background-color: #004d99;
          }

          .download-app-button:hover {
            background-color: #0056b3;
          }

          .user-info {
            background-color: #f9f9f9;
            padding: 20px;
            margin-top: 20px;
            border-radius: 5px;
          }

          img {
            max-width: 100px;
            margin-bottom: 20px;
          }

          .icon {
            margin-right: 10px;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="header">
            <h1><i class="fas fa-shield-alt icon"></i>Bem-vindo</h1>
          </div>

          <div class="content">
            <p>Olá ${user.name},</p>
            <p>Seu registro no nosso sistema de controle de acesso e presença multimodal foi criado com sucesso. Abaixo estão os detalhes da sua conta:</p>

            <div class="user-info">
              <p><strong>Nome:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Telefone:</strong> ${user.phone}</p>
              <!-- Outras informações relevantes do usuário podem ser adicionadas aqui -->
            </div>

            <p>Se algum destes dados estiver incorreto, por favor entre em contato conosco pelo e-mail <a href="mailto:suporte@multacess.pt">suporte@multacess.pt</a>.</p>

            <p>Para ativar sua conta e definir sua senha, por favor clique no link abaixo:</p>
            <p><a class="button reset-password-button" href="${resetLink}"><i class="fas fa-lock icon"></i>Redefinir Senha</a></p>
            <p>Se clicar em Repor palavra-passe não funcionar, copie e cole esta ligação no seu browser: ${resetLink}</p>

            <p>Após configurar sua senha, você poderá usar todas as funcionalidades do sistema, incluindo controle de acesso via NFC e impressão digital.</p>
            
            <p>Baixe nosso aplicativo para gerenciar suas presenças e acessos facilmente:</p>
            <p><a class="button download-app-button" href="LINK_PARA_BAIXAR_APP"><i class="fas fa-cloud-download-alt icon"></i>Baixar Aplicativo</a></p>
          </div>

          <div class="footer">
            <p>Este é um e-mail automático, por favor não responda.</p>
            <p>Se você tem alguma dúvida ou precisa de suporte, entre em contato conosco.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: 'not-reply@multacess.com',
    to: user.email,
    subject: 'Bem-vindo ao Sistema de Controle de Acesso e Presença',
    html: emailBody
  });
};