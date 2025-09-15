<script>
  import { onDestroy } from 'svelte';
  import { PUBLIC_API_BASE } from '$env/static/public';
  const API_BASE = PUBLIC_API_BASE || '';

  let selectedFile = null;
  let message = '';
  let faceShape = '';
  let recommendedHaircuts = [];
  let isLoading = false;
  let imagePreviewUrl = '';

  let videoElement;
  let canvasElement;
  let stream = null;
  let capturedImageBlob = null;

  // Function to start camera stream
  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoElement) {
         videoElement.srcObject = stream;
      }
       message = ''; // Clear messages on camera start
       selectedFile = null; // Clear selected file
       imagePreviewUrl = ''; // Clear file preview
       capturedImageBlob = null; // Clear previous captured image
       faceShape = ''; // Clear previous results
       recommendedHaircuts = []; // Clear previous results
    } catch (err) {
      console.error("Error accessing camera: ", err);
      message = 'Error accessing camera. Please ensure you have a webcam and granted permission.';
      stream = null;
    }
  }

  // Function to stop camera stream
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  // Function to capture frame from video
  function captureImage() {
    if (videoElement && canvasElement) {
      const context = canvasElement.getContext('2d');
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      canvasElement.toBlob((blob) => {
        capturedImageBlob = blob;
        if (imagePreviewUrl) {
           URL.revokeObjectURL(imagePreviewUrl);
        }
        imagePreviewUrl = URL.createObjectURL(blob);
        selectedFile = null;
        message = 'Image Captured!';
      }, 'image/png');
    } else {
        message = 'Camera stream not active.';
    }
  }

  async function handleFileUpload(event) {
    selectedFile = event.target.files[0];
    if (selectedFile) {
      if (imagePreviewUrl) {
         URL.revokeObjectURL(imagePreviewUrl);
      }
      imagePreviewUrl = URL.createObjectURL(selectedFile);
      message = '';
      faceShape = '';
      recommendedHaircuts = [];
      stopCamera();
      capturedImageBlob = null;
    } else {
      if (imagePreviewUrl) {
         URL.revokeObjectURL(imagePreviewUrl);
      }
      imagePreviewUrl = '';
      message = '';
      faceShape = '';
      recommendedHaircuts = [];
      selectedFile = null;
      capturedImageBlob = null;
    }
  }

  async function handleSubmit() {
    let fileToUpload = selectedFile || capturedImageBlob;
    if (!fileToUpload) {
      message = 'Please select an image file or capture an image from camera.';
      return;
    }
    const formData = new FormData();
    formData.append('file', fileToUpload, selectedFile ? selectedFile.name : 'captured_image.png');
    message = '';
    faceShape = '';
    recommendedHaircuts = [];
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE}/uploadimage/`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        faceShape = result.face_shape;
        recommendedHaircuts = result.recommended_haircuts;
        message = 'Analysis Complete!';
      } else {
        const error = await response.json();
        message = `Error: ${error.detail || response.statusText}`;
      }
    } catch (error) {
      message = `An error occurred: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }

  onDestroy(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    stopCamera();
  });
</script>

<div class="main-bg">
<div class="container">
    <header class="main-header">
      <div class="logo-circle"> <span>✂️</span> </div>
      <div>
    <h1>FaceCut AI</h1>
    <p>Analyze your face shape and get personalized haircut recommendations using AI.</p>
      </div>
  </header>

    <div class="main-content">
  <section class="upload-section">
        <div class="card upload-card">
    <div class="camera-upload-options">
       {#if stream}
        <div class="camera-container">
            <video bind:this={videoElement} autoplay playsinline></video>
                <div class="camera-btn-row">
            <button class="secondary-button" on:click={captureImage} disabled={isLoading}>Capture Image</button>
                  <button class="secondary-button" on:click={stopCamera} disabled={isLoading}>Stop Camera</button>
                </div>
                <canvas bind:this={canvasElement} style="display: none;"></canvas>
        </div>
            {:else}
        <button class="secondary-button" on:click={startCamera} disabled={isLoading}>Start Camera</button>
       {/if}

       <div class="or-divider">OR</div>

        <div class="file-upload-container">
            <form on:submit|preventDefault={handleSubmit}>
                <div class="file-input-group">
                  <input type="file" accept="image/*" on:change={handleFileUpload} disabled={isLoading} id="fileInput" class="file-input">
                  <label for="fileInput" class="custom-button">
                    {#if selectedFile}
                      Image Selected: {selectedFile.name}
                    {:else}
                      Upload Image
                    {/if}
                  </label>
                </div>
            </form>
        </div>
    </div>

    <div class="analyze-button-container">
         <button type="submit" class="primary-button" on:click|preventDefault={handleSubmit} disabled={isLoading || (!selectedFile && !capturedImageBlob)}>
            {#if isLoading}
              Analyzing...
            {:else}
              Analyze Face Shape
            {/if}
          </button>
    </div>

    {#if imagePreviewUrl}
      <div class="image-preview-container">
        <img src="{imagePreviewUrl}" alt="Image Preview" class="image-preview"/>
      </div>
    {/if}

     {#if message}
        <p class="message {message.startsWith('Error') ? 'error' : 'success'}">{message}</p>
      {/if}
        </div>
  </section>

      <section class="results-section side-by-side-results">
        <div class="card results-card">
    {#if faceShape}
      <h2>Detected Face Shape: <span>{faceShape}</span></h2>
    {/if}
    {#if recommendedHaircuts.length > 0}
      <h3>Recommended Haircuts:</h3>
      <div class="haircut-grid">
        {#each recommendedHaircuts as haircut}
          <div class="haircut-card">
            {#if haircut.image}
              <img src="{`${API_BASE}/haircuts/${haircut.image}`}" alt="{haircut.name}" class="haircut-image"/>
            {/if}
            <div class="haircut-info">
              <h4>{haircut.name}</h4>
              <p>{haircut.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {:else if faceShape && recommendedHaircuts.length === 0 && !isLoading}
      <p>No haircut recommendations found for {faceShape} face shape yet. Check back later!</p>
    {/if}
        </div>
  </section>
    </div>

    <footer class="footer">
      <span>© {new Date().getFullYear()} MOHAN MAHESH. All rights reserved.</span>
    </footer>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', 'Arial', sans-serif;
    background: linear-gradient(135deg, #f4f7f6 0%, #e9e6f7 100%);
    color: #333;
    line-height: 1.6;
  }
  .main-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f7f6 0%, #e9e6f7 100%);
  }
  .container {
    max-width: 960px;
    margin: 30px auto;
    padding: 30px 20px 10px 20px;
    background-color: #fff;
    box-shadow: 0 4px 24px rgba(90, 79, 207, 0.08);
    border-radius: 16px;
    position: relative;
    z-index: 2;
  }
  .main-header {
    display: flex;
    align-items: center;
    gap: 18px;
    text-align: left;
    margin-bottom: 32px;
    padding-bottom: 18px;
    border-bottom: 1px solid #eee;
  }
  .logo-circle {
    width: 56px;
    height: 56px;
    background: #5a4fcf;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 2px 8px rgba(90, 79, 207, 0.12);
  }
  .main-header h1 {
    color: #5a4fcf;
    margin: 0 0 6px 0;
    font-size: 2.2rem;
    font-weight: 700;
  }
  .main-header p {
    color: #666;
    font-size: 1.1em;
    margin: 0;
  }
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  @media (min-width: 900px) {
    .main-content {
      flex-direction: row;
      align-items: stretch;
      gap: 40px;
    }
    .upload-section, .results-section.side-by-side-results {
      flex: 1 1 0;
      min-width: 0;
    }
    .upload-card, .results-card {
      max-width: none;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    .results-section.side-by-side-results {
      margin-top: 0;
    }
  }
  @media (max-width: 899px) {
    .container {
      padding: 30px 8px 10px 8px;
    }
  }
  .upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    margin-bottom: 40px;
    padding: 0;
    background: none;
    border-radius: 0;
  }
  .card {
    background: #f9f9fe;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(90, 79, 207, 0.07);
    padding: 32px 24px;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    animation: fadeInUp 0.5s;
  }
  .upload-card {
    margin-bottom: 0;
  }
  .results-card {
    margin-top: 0;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
 .camera-upload-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
 }
  .camera-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .camera-btn-row {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }
  video {
    max-width: 320px;
    height: auto;
    border: 2px solid #5a4fcf;
    border-radius: 8px;
    background: #222;
    box-shadow: 0 2px 8px rgba(90, 79, 207, 0.08);
  }
  .or-divider {
    margin: 20px 0;
    font-weight: bold;
    color: #666;
  }
  .file-upload-container {
    width: 100%;
    max-width: 300px;
  }
  .file-input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 0;
  }
  .file-input {
    display: none;
  }
  .custom-button, .primary-button, .secondary-button {
    display: inline-block;
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, opacity 0.3s;
    text-align: center;
    text-decoration: none;
    font-weight: 500;
  }
  .custom-button {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
    flex-grow: 1;
  }
  .custom-button:hover {
    background-color: #e0e0e0;
  }
  .primary-button {
    background-color: #5a4fcf;
    color: white;
    border: none;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .primary-button:hover:not(:disabled) {
    background-color: #4a3ecf;
  }
  .primary-button:disabled,
  .secondary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .secondary-button {
    background-color: #ccc;
      color: #333;
      border: 1px solid #999;
  }
   .secondary-button:hover:not(:disabled) {
      background-color: #bbb;
   }
  .analyze-button-container {
      width: 100%;
      text-align: center;
    margin-top: 18px;
  }
  .message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }
  .success {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  }
  .image-preview-container {
    max-width: 300px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
  }
  .image-preview {
    display: block;
    max-width: 100%;
    height: auto;
  }
  .results-section {
    margin-top: 40px;
    animation: fadeIn 0.5s ease-out;
  }
  .results-section h2,
  .results-section h3 {
      text-align: center;
      color: #5a4fcf;
      margin-bottom: 20px;
  }
  .results-section h2 span {
      color: #333;
  }
  .haircut-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  .haircut-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
  }
  .haircut-card:hover {
    box-shadow: 0 4px 16px rgba(90, 79, 207, 0.13);
  }
  .haircut-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .haircut-info {
    padding: 15px;
    flex-grow: 1;
  }
  .haircut-info h4 {
    margin-top: 0;
    margin-bottom: 5px;
    color: #333;
  }
  .haircut-info p {
    color: #666;
    font-size: 0.95em;
  }
  .footer {
    margin-top: 48px;
    text-align: center;
    color: #aaa;
    font-size: 0.98em;
    padding-bottom: 10px;
  }
</style>