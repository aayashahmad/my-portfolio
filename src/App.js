import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SplashCursor from './components/ui/splashCursor.js'

import Home from "./components/home";
import About from "./components/About/about";
import Portfolio from "./components/portfolio";
import Contact from "./components/contact";
import Skills from "./components/Skills/skills";
import Experience from "./components/Experience/experience";
import Projects from "./components/myProjects/projects";
import TrueFocus from "./components/ui/textFocus/trueFocus";
import { ConfettiButton } from './components/ui/ConfettiButton.js';
import AIAssistButton from './components/aiAgent/aiAssistAgent.js';


function App() {
  const handleDownload = () => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "https://aayashahmad.github.io/my-portfolio/aayash_CV.pdf";
      link.download = "aayash_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };
  
  return (
    <Router>
      <div className="main-container">
        <div className="inner-container">
        <AIAssistButton  />
     
          <div className="left-section">
       
            <div className="circle-img">
              <div className="inner-circle">
                <img
                  manualMode={false}
                  src={`${process.env.PUBLIC_URL}/ayash.jpeg`}
                  alt="Profile"
                />
              </div>
              
            </div>
          
            <h3 className="brand">Aayash Ahmad</h3>
          </div>

          <div className="right-section">
            <nav className="navbar">
              <ul>
                <li>
                  <Link className="nav-link" to="/skills">
                    Skills
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/about">
                    About Me
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/experience">
                    Experience
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/projects">
                    My Projects
                  </Link>
                </li>

                {/* <li><Link className="btn" to="/contact">Contact Me</Link></li>  */}
                <li>
               
                  <Link className="btn" to="/home">
               
                    Home
                   
                  </Link>
                
                </li>
              </ul>
            
            </nav>

            <div className="content">
              <h1>Aayash Ahmad Bhat</h1>
              <p className="subtitle">React Js Developer</p>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/skills" element={<Skills />} />
              </Routes>
            <ConfettiButton>
              <a
      onClick={handleDownload}
      className="download-btn bg-blue-500 text-white "
    >
      Download CV
    </a>
    </ConfettiButton>
              {/* <a
            
                href="https://aayashahmad.github.io/my-portfolio/aayash_CV.pdf"
                className="download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download CV
              </a> */}
             
              <div className="icons">
                <a
                  href="https://github.com/aayashahmad"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a
                  href="https://www.facebook.com/share/16M5crKhvY/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://www.linkedin.com/in/aayash-ahmad-185036242"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href="https://www.instagram.com/bhat__ashu"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://www.snapchat.com/add/bhatashu8033"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-snapchat-ghost"></i>
                </a>
                <a href="mailto:bhatashu666@gmail.com">
                  <i className="fas fa-envelope"></i>
                </a>
                {/* <ConfettiButton >Tab me!</ConfettiButton> */}
              </div>
           
            </div>
          
          </div>
        
        </div>
        
      
        <SplashCursor />
        
      </div>
     
    </Router>
  );
}

export default App;
