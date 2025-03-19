import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  InputAdornment,
  Grid,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const OptionsTradeDialog = ({ open, onClose, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [strikePrice, setStrikePrice] = useState('');
  const [optionType, setOptionType] = useState('call');
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState('buy');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!symbol || !expiryDate || !strikePrice) {
      setNotification({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Format the expiry date to MM/DD/YYYY
    const formattedDate = expiryDate ? 
      `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}${expiryDate.getDate().toString().padStart(2, '0')}${expiryDate.getFullYear().toString().slice(2)}` : '';
    
    // Format the strike price
    const formattedStrike = strikePrice.toString().padStart(5, '0');
    
    // Build options symbol in OCC format: SPY220916C00425000
    const optionsSymbol = `${symbol}${formattedDate}${optionType === 'call' ? 'C' : 'P'}${formattedStrike}`;
    
    // Call the parent's onSubmit with the trade details
    onSubmit({
      symbol: optionsSymbol,
      quantity,
      action,
      originalSymbol: symbol,
      expiry: expiryDate,
      strike: strikePrice,
      type: optionType
    });
    
    // Reset form
    resetForm();
  };
  
  const resetForm = () => {
    setSymbol('');
    setExpiryDate(null);
    setStrikePrice('');
    setOptionType('call');
    setQuantity(1);
    setAction('buy');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Trade Options
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Place an options trade with market order
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <form id="options-trade-form" onSubmit={handleFormSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  fullWidth
                  required
                  helperText="Enter the underlying stock symbol (e.g., SPY, AAPL)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={setExpiryDate}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth required helperText="Select the option's expiration date" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Strike Price"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="Enter the strike price (e.g., 425.00)"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Option Type</InputLabel>
                  <Select
                    value={optionType}
                    onChange={(e) => setOptionType(e.target.value)}
                    label="Option Type"
                  >
                    <MenuItem value="call">Call</MenuItem>
                    <MenuItem value="put">Put</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    label="Action"
                  >
                    <MenuItem value="buy">Buy</MenuItem>
                    <MenuItem value="sell">Sell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            form="options-trade-form" 
            variant="contained" 
            color={action === 'buy' ? 'primary' : 'error'}
          >
            {action === 'buy' ? 'Buy' : 'Sell'} {optionType === 'call' ? 'Call' : 'Put'} Options
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OptionsTradeDialog;
