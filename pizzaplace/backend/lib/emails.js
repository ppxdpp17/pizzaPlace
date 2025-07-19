import { mailTrapClient, sender } from "./mailtrap.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

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