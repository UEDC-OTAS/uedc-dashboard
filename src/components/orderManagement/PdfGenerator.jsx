import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Function to load fonts and wait for them to be ready
async function loadFonts() {
  return new Promise((resolve) => {
    // Add Myanmar font
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;700&family=Arial:wght@400;500;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(resolve, 1000); // Additional wait time
      });
    } else {
      setTimeout(resolve, 2000); // Fallback wait time
    }
  });
}

// Format date to Myanmar format
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
}

// Format price with commas
// function formatPrice(price) {
//   return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

// Function to format address with proper line breaks
function formatAddress(address) {
  // Split address by common separators and clean up
  const parts = address
    .split(/[,،]/) // Split by comma or Arabic comma
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  // Group parts into lines (max 2-3 parts per line for readability)
  const lines = [];
  let currentLine = [];
  let currentLength = 0;

  for (const part of parts) {
    // If adding this part would make the line too long (>40 chars) or we have 3 parts already
    if (
      (currentLength + part.length > 40 && currentLine.length > 0) ||
      currentLine.length >= 3
    ) {
      lines.push(currentLine.join(", "));
      currentLine = [part];
      currentLength = part.length;
    } else {
      currentLine.push(part);
      currentLength += part.length + 2; // +2 for ", "
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine.join(", "));
  }

  return lines;
}

// Create voucher HTML with inline styles for better PDF rendering
function createVoucherHTML(orderData) {
  const { snapshotData } = orderData;
  const addressLines = formatAddress(snapshotData.address);

  return `
    <div style="
      width: 794px; 
      background: white; 
      font-family: Arial, sans-serif; 
      font-size: 14px; 
      line-height: 1.4;
      color: #000;
      padding: 20px;
      box-sizing: border-box;
    ">
      <!-- Header -->
      <div style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 15px; 
        border-bottom: 2px solid #000;
        margin-bottom: 20px;
      ">
        <div>
          <h1 style="
            font-size: 28px; 
            font-weight: bold; 
            margin: 0; 
            letter-spacing: 3px;
            color: #000;
            font-family: Arial, sans-serif;
          ">UEDC</h1>
          
        </div>
        <div style="text-align: center;">
          <h2 style="
            font-size: 28px; 
            font-weight: bold; 
            margin: 0;
            color: #000;
            font-family: Arial, sans-serif;
          ">Sale Order</h2>
         
        </div>
        <div style="width: 150px;"></div>
      </div>

      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 30px;">
              <!-- Left Column -->
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">Customer : </span>
                <span style="margin-top: 5px; color: #000; font-family: Arial, sans-serif;">
                  ${snapshotData.customerName}
                </span>
                
              </div>
              
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">Phone <span style="margin-left:22px;"> : </span></span>
                <span style="color: #000; font-family: Arial, sans-serif;">${
                  snapshotData.contactNumber
                }</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">Address :</span>
                <div style="
                  margin-top: 5px;
                  line-height: 1.5; 
                  color: #000; 
                  font-family: Arial, sans-serif;
                  word-wrap: break-word;
                  word-break: break-word;
                  max-width: 280px;
                ">
                  ${addressLines
                    .map(
                      (line) => `<div style="margin-bottom: 3px;">${line}</div>`
                    )
                    .join("")}
                </div>
              </div>
            </td>
            
            <td style="width: 50%; vertical-align: top;">
              <!-- Right Column -->
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">Date : </span>
                <span style="color: #000; font-family: Arial, sans-serif;">${formatDate(
                  snapshotData.createdAt
                )}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">So No. : </span>
                <span style="color: #000; font-family: Arial, sans-serif;">${orderData.orderId
                  .slice(-8)
                  .toUpperCase()}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <span style="font-weight: bold; color: #000; font-family: Arial, sans-serif;">Pay Type : </span>
                <span style="color: #000; font-family: Arial, sans-serif;">${
                  snapshotData.paymentType === "cash-on-delivery"
                    ? "Cash on Delivery"
                    : snapshotData.paymentType
                }</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="
        width: 100%; 
        border-collapse: collapse; 
        border: 2px solid #000;
        margin-bottom: 20px;
      ">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 40px;
            ">
              Sr
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 80px;
            ">
              Usr Code
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
            ">
              Description
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 60px;
            ">
              QTY
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 60px;
            ">
              Unit
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 100px;
            ">
              Unit Price
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 100px;
            ">
              Amount
            </th>
            <th style="
              border: 1px solid #000; 
              padding: 10px; 
              text-align: center; 
              font-weight: bold;
              color: #000;
              font-family: Arial, sans-serif;
              width: 80px;
            ">
              Remark
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              1
            </td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              ${snapshotData.productCode}
            </td>
            <td style="border: 1px solid #000; padding: 8px; color: #000; font-family: Arial, sans-serif;">
              <div style="font-weight: bold;">${snapshotData.productName}</div>
              <div style="font-size: 12px; color: #666; margin-top: 2px;">Delivery: ${
                snapshotData.deliveryServiceName
              }</div>
              <div style="font-size: 12px; color: #666; margin-top: 2px;">Status: ${
                snapshotData.deliveryStatus
              }</div>
            </td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              ${snapshotData.quantity}.00
            </td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              လုံး
            </td>
          
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              
            </td>
          </tr>
          
          <!-- Remark Row -->
          <tr>
            <td colspan="4" style="border: 1px solid #000; padding: 8px; color: #000; font-family: Arial, sans-serif;">
              Remark: Contact ID: ${snapshotData.contactId} | PSID: ${
    snapshotData.psid
  }
            </td>
            <td colspan="2" style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-family: Arial, sans-serif;">
              Invoice Total:
            </td>
           
            <td style="border: 1px solid #000; padding: 8px;"></td>
          </tr>
          
          <!-- Sign Row -->
          <tr>
            <td colspan="4" style="border: 1px solid #000; padding: 8px;"></td>
            <td colspan="2" style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-family: Arial, sans-serif;">
              Sign
            </td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-family: Arial, sans-serif; font-size: 18px;">
              
            </td>
            <td style="border: 1px solid #000; padding: 8px;"></td>
          </tr>
        </tbody>
      </table>

      
    </div>
  `;
}

// PDF Generation Function with better text rendering
export async function generatePDF(orderData) {
  try {
    // Load fonts first
    await loadFonts();

    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.backgroundColor = "white";

    // Set the HTML content
    container.innerHTML = createVoucherHTML(orderData);

    // Add to document
    document.body.appendChild(container);

    // Wait a bit more for rendering
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate canvas with better options
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: container.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: container.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure fonts are applied in cloned document
        const style = clonedDoc.createElement("style");
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;700&display=swap');
          * { 
            font-family: Arial, sans-serif !important; 
            color: #000 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pdfHeight;
    }

    // Download the PDF
    const orderNumber = orderData.orderId.slice(-8).toUpperCase();
    pdf.save(`Sale_Order_${orderNumber}.pdf`);

    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
}
