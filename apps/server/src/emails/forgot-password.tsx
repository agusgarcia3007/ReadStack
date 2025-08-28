import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  name: string;
  resetLink: string;
}

export function ForgotPasswordEmail({
  name,
  resetLink,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablecer contraseña de tu cuenta</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-gray-200 rounded my-10 mx-auto p-5 w-96">
            <Section className="mt-8">
              <Heading className="text-black text-2xl font-normal text-center p-0 my-8 mx-0">
                Restablecer contraseña
              </Heading>
              <Text className="text-black text-sm leading-6">Hola {name},</Text>
              <Text className="text-black text-sm leading-6">
                Recibimos una solicitud para restablecer la contraseña de tu
                cuenta.
              </Text>
              <Text className="text-black text-sm leading-6">
                Haz clic en el siguiente botón para crear una nueva contraseña:
              </Text>
              <Section className="text-center mt-8 mb-8">
                <Button
                  className="bg-blue-600 rounded text-white text-sm font-semibold no-underline text-center px-5 py-3"
                  href={resetLink}
                >
                  Restablecer contraseña
                </Button>
              </Section>
              <Text className="text-black text-sm leading-6">
                Este enlace expirará en 24 horas por motivos de seguridad.
              </Text>
              <Text className="text-black text-sm leading-6">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este
                correo de forma segura.
              </Text>
              <Text className="text-gray-500 text-xs leading-6 mt-6">
                Si tienes problemas haciendo clic en el botón, copia y pega el
                siguiente enlace en tu navegador:
                <br />
                <Link href={resetLink} className="text-blue-600 no-underline">
                  {resetLink}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
