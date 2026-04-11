export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "linear-gradient(160deg, rgba(22, 119, 255, 0.12) 0%, rgba(114, 46, 209, 0.08) 45%, #f5f5f5 100%)",
      }}
    >
      {children}
    </div>
  );
}
