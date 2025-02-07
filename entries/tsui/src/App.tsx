import React, { useState, useRef } from 'react';
import { Download, Github, Linkedin, Mail, Twitter } from 'lucide-react';

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(true);

  const downloadHTML = () => {
    if (!contentRef.current) return;
    
    // Clone the content
    const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Remove all contentEditable attributes
    const editableElements = clonedContent.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(el => {
      el.removeAttribute('contenteditable');
    });
    
    // Create the full HTML document
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Personal Portfolio">
    <title>My Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    ${clonedContent.outerHTML}
</body>
</html>`;

    // Create and trigger download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with controls */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editMode ? 'Preview Mode' : 'Edit Mode'}
          </button>
          <button
            onClick={downloadHTML}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} /> Download HTML
          </button>
        </div>
      </div>

      {/* Main content */}
      <div ref={contentRef} className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 
              contentEditable={editMode}
              className="text-4xl font-bold text-gray-900 sm:text-6xl"
              suppressContentEditableWarning
            >
              John Doe
            </h1>
            <p 
              contentEditable={editMode}
              className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto"
              suppressContentEditableWarning
            >
              Full Stack Developer specializing in building exceptional digital experiences.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900"><Github /></a>
              <a href="#" className="text-gray-600 hover:text-gray-900"><Linkedin /></a>
              <a href="#" className="text-gray-600 hover:text-gray-900"><Twitter /></a>
              <a href="#" className="text-gray-600 hover:text-gray-900"><Mail /></a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Me</h2>
          <div 
            contentEditable={editMode}
            className="prose lg:prose-xl"
            suppressContentEditableWarning
          >
            <p>
              I'm a passionate developer with over 5 years of experience in building web applications.
              My expertise includes React, TypeScript, and Node.js. I love creating intuitive and
              performant user experiences.
            </p>
          </div>
        </section>

        {/* Projects Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((project) => (
              <div key={project} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={`https://source.unsplash.com/random/800x600?tech&sig=${project}`}
                  alt="Project thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 
                    contentEditable={editMode}
                    className="text-xl font-semibold mb-2"
                    suppressContentEditableWarning
                  >
                    Project {project}
                  </h3>
                  <p 
                    contentEditable={editMode}
                    className="text-gray-600"
                    suppressContentEditableWarning
                  >
                    Description of project {project}. Click to edit this text when in edit mode.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact</h2>
          <div 
            contentEditable={editMode}
            className="text-lg text-gray-600"
            suppressContentEditableWarning
          >
            <p>Email: john.doe@example.com</p>
            <p>Location: San Francisco, CA</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;