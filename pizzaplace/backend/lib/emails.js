import { mailTrapClient, sender } from "./mailtrap.js";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verifique o seu email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email enviado com sucesso", response);
    } catch (error) {
        console.error("Erro ao mandar email de verificação", error);
        throw new Error(`Erro ao enviar email de verificação: ${error}`);
    }
}

export const enviarEmailWelcome = async (email, nome) => {
    const recipient = [{email}];

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "707f6f2e-9c2f-4146-84f3-0a6eb59296ea",
            template_variables: {
                "company_info_name": "Big Boss'",
                "name": nome,
                "company_info_address": "Rua Dr. Manuel Cardona,2 B",
                "company_info_city": "Vila Real",
                "company_info_zip_code": "5000-558",
                "company_info_country": "Portugal"
            }
        })

        console.log("Email de Bem-Vindo enviado com sucesso", response);
    } catch (error) {
        console.error("Erro ao enviar email de bem-vindo", error);
        throw new Error(`Erro ao enviar email de bem-vindo: ${error}`);
    }
}

export const enviarPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: "Redefinir Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        })
    } catch (error) {
        console.error("Erro ao enviar email de redefinição de password", error);
        throw new Error(`Erro ao enviar email de redefinição de password: ${error}`);
    }
}