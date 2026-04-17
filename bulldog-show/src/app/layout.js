import "./globals.css";

export const metadata = {
  title: "Bulldog Show",
  description: "Production Manager"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
