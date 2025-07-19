export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifique o seu Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verificação de Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Olá,</p>
    <p>Obrigado por ter criado uma conta! O seu código de verificação é:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Insira este código na página de verificação para completar o seu registo.</p>
    <p>Por razões de segurança, este código expirará em 15 minutos.</p>
    <p>No caso de não ter criado nenhuma conta, por favor ignore este email.</p>
    <p>Com os Melhores Cumprimentos,<br>A equipa Big Boss'</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Isto é uma mensagem gerada automaticamente, por favor não responda a este email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Password efetuada com Sucesso</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Recuperação de Password efetuada com Sucesso</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Olá,</p>
    <p>Enviamos este email para o informar que a sua recuperação de password foi efetuada com sucesso.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>Se não efetuou qualquer pedido de recuperação de password, contacte a nossa equipa de suporte imediatamente.</p>
    <p>Por razões de segurança, recomendamos que:</p>
    <ul>
      <li>Utilize uma password segura e forte</li>
      <li>Configure autenticação de dois fatores</li>
      <li>Evite utilizar a mesma password em diferentes sites</li>
    </ul>
    <p>Obrigado por nos ajudar a manter a segurança da sua conta.</p>
    <p>Com os melhores cumprimentos,<br>A Equipa Big Boss</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Isto é uma mensagem gerada automaticamente, por favor não responda a este email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Recuperação de Password</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Olá,</p>
    <p>Recebemos um pedido para reposição da password. Se não efetuou qualquer pedido, por favor ignore este email.</p>
    <p>Para repôr a sua password, por favor clique no botão abaixo:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Repôr Password</a>
    </div>
    <p>Por razões de segurança, este botão irá expirar em 1 hora.</p>
    <p>Com os melhores cumprimentos,<br>A Equipa Big Boss</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Isto é uma mensagem gerada automaticamente, por favor não responda a este email.</p>
  </div>
</body>
</html>
`;