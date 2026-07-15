export function triggerSparks() {
  if (typeof window === "undefined") return;

  const cursorEl = document.querySelector(".typing-cursor");
  if (!cursorEl) return;

  const rect = cursorEl.getBoundingClientRect();
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY + rect.height / 2;

  // Read accent color from localStorage
  const activeAccent = localStorage.getItem("tc-accent") || "aurora";
  let color = "#06B6D4"; // default aurora
  if (activeAccent === "classic") color = "#F57644";
  else if (activeAccent === "mint") color = "#86C8AC";
  else if (activeAccent === "royal") color = "#E4D440";
  else if (activeAccent === "dolch") color = "#D73E42";
  else if (activeAccent === "sand") color = "#C94E41";
  else if (activeAccent === "scarlet") color = "#D5868A";

  const numSparks = 6;
  const container = document.body;

  for (let i = 0; i < numSparks; i++) {
    const spark = document.createElement("span");
    spark.className = "keystroke-spark pointer-events-none absolute z-50 rounded-full";

    const size = Math.random() * 4 + 3; // 3px to 7px
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.backgroundColor = color;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.boxShadow = `0 0 8px ${color}`;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 20; // 20px to 60px
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 20; // slightly upward arc

    container.appendChild(spark);

    spark.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 },
      ],
      {
        duration: 400 + Math.random() * 200,
        easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
        fill: "forwards",
      }
    );

    setTimeout(() => {
      spark.remove();
    }, 600);
  }
}
