import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const AIAssistChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I am Aayash's AI Agent. How can I assist you?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 73fd31f766f6b338be223074ed1393166eff51a94cd20c25ce2984aab612aed9`
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.1",
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: input }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage = { text: data.choices[0].message.content, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        text: '⚠️ API limit reached or an error occurred. This is a mock response.',
        sender: 'ai'
      }]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Paper elevation={3} sx={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '350px',
        maxHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="primary.main" color="white">
          <Typography variant="h6">AI Assistant</Typography>
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box flex={1} overflow="auto" p={2} sx={{ maxHeight: '400px' }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{
                bgcolor: message.sender === 'ai' ? 'action.hover' : 'background.paper',
                borderRadius: 1,
                mb: 1
              }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.sender === 'ai' ? 'primary.main' : 'grey.500' }}>
                    {message.sender === 'ai' ? 'AI' : 'You'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.text}
                  secondary={message.sender === 'ai' ? 'AI Assistant' : 'You'}
                  sx={{ whiteSpace: 'pre-wrap' }}
                />
              </ListItem>
            ))}
            {isLoading && (
              <ListItem>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <ListItemText primary="AI is thinking..." />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box display="flex" p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            sx={{ ml: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AIAssistChat;
