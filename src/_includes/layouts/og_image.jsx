const formatDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function (page) {
  const kind = page.openGraphKind || "post";
  const siteName = page.metas?.site || "Ilyes Hernandez";
  const title = page.openGraphTitle || page.title || siteName;
  const tags = Array.isArray(page.tags) ? page.tags.slice(0, 3) : [];
  const date = formatDate(page.date);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAF8F3",
        color: "#121318",
        boxSizing: "border-box",
        padding: "64px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: kind === "home" ? "center" : "space-between",
          gap: "20px",
          maxWidth: "1040px",
          width: "100%",
          alignItems: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "Geist Pixel",
            fontSize: kind === "home" ? "92px" : "74px",
            lineHeight: kind === "home" ? 1 : 0.94,
            letterSpacing: kind === "home" ? "-0.03em" : "-0.04em",
            color: "#121318",
            wordBreak: "break-word",
            fontWeight: 700,
          }}
        >
          {kind === "home" ? siteName : title}
        </h1>

        {kind === "post" ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              justifyContent: "space-between",
              fontFamily: "Geist Pixel",
              fontSize: "18px",
              color: "#3d4b66",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "flex-start",
                flex: "1",
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(135deg, #FEAADB, #F5EEDC, #608CFA)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderRadius: "999px",
                      backgroundColor: "#FAF8F3",
                      opacity: 0.9,
                    }}
                  >
                    {tag}
                  </span>
                </span>
              ))}
            </div>

            {date ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "10px 0",
                  minWidth: "180px",
                  textAlign: "right",
                  opacity: 0.8,
                }}
              >
                {date}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
