import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material'; 
import AIAssistChat from './aiAssistchat';
import ChatIcon from '@mui/icons-material/Chat';

const AIAssistButton = () => {
  const [openChat, setOpenChat] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Tooltip title="AI Assistant" placement="left">
        <Button
          onClick={() => setOpenChat(!openChat)}
          style={{
            backgroundColor: '#6a0dad',
            color: '#fff',
            borderRadius: '50%',
            minWidth: '60px',
            height: '60px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ChatIcon fontSize="large" />
        </Button>
      </Tooltip>

      {openChat && (
        <AIAssistChat onClose={() => setOpenChat(false)} />
      )}
    </div>
  );
};

export default AIAssistButton;
