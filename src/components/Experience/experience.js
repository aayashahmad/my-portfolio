import React from 'react';
import './experience.css';

const Experience = () => {
  const styles = {
  
  
    // text: {
    //   marginBottom: '20px',
     
    // },
  };

  return (
    <div>
    <section className="experience">
    <h3 >Experience</h3>
    <div className='exp'>
      <h4 className={styles.text}>Octanet Services Pvt Ltd.</h4>
      <p className="date">Dec 2023 - Jan 2024</p>
      <p className="position">Web Development Intern</p>
      <ul className='exp-list'>
        <li>Created responsive web pages with HTML,<br/> CSS, and JavaScript</li>
        <li>Fixed layout and design issues</li>
        <li>Collaborated on projects via Git</li>
      </ul>
    </div>
  </section>
  </div>
  );
};

export default Experience;
