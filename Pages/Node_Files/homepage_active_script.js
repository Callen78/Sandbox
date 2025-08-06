// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    const zoomImages = document.querySelectorAll(".zoom-img");
  
    zoomImages.forEach((img) => {
      img.addEventListener("mouseenter", () => {
        img.style.transform = "scale(1.2)";
        img.style.zIndex = "10"; // Optional: brings it above other elements
      });
  
      img.addEventListener("mouseleave", () => {
        img.style.transform = "scale(1)";
        img.style.zIndex = "1";
      });
    });
  });
  
  