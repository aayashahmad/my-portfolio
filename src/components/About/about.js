import React from 'react';
import './about.css';

const About = () => {
  const styles = {
  
    // text: {
    //   fontSize: '18px',
    //   color: '#666',
    //   marginTop: '20px',
    //   wordWrap: 'break-word',
    //   lineHeight: '1.6',
    // },
  };

  return (
    <div style={styles.container}>
      <section>
        <h3 style={styles.title}>About Me</h3>
        <p className='text'>
          A passionate web developer with experience in React.js, <br/>JavaScript, and responsive web design. <br/>
          Skilled in creating user-friendly <br/>and visually appealing websites.<br/> Strong problem-solving 
          abilities and a team player.
        </p>
      </section>
    </div>
  );
};

export default About;
