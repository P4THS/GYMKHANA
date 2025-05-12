// components/LoginCard.js
import {
  Box, Typography, TextField, FormControlLabel, Checkbox,
  Button, IconButton, InputAdornment, Paper, Alert
} from '@mui/material';
import { Visibility, VisibilityOff, FitnessCenter } from '@mui/icons-material';

export default function LoginCard({
  values, handleChange, handleClickShowPassword, handleSubmit, error
}) {
  return (
    <Paper elevation={4} sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(28,28,28,0.75)',
        borderRadius: 3,
        p: 4,
        color: '#fff',
        width: '100%',       // ensures it’s responsive
   maxWidth: '700px',   // caps the card’s width
   mx: 'auto',          // centers it horizontally
      }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <FitnessCenter sx={{ fontSize: 48, color: 'secondary.main' }} />
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>Welcome Back</Typography>
        <Typography variant="body2" color="text.secondary">Enter your credentials to continue</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          fullWidth required margin="normal"
          label="Username or Email" variant="filled"
          InputProps={{ disableUnderline: true }}
          value={values.username} onChange={handleChange('username')}
        />

        <TextField
          fullWidth required margin="normal"
          label="Password" variant="filled"
          type={values.showPassword ? 'text' : 'password'}
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {values.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={values.password} onChange={handleChange('password')}
        />

        

        <Button
          type="submit" fullWidth variant="contained" size="large"
          sx={{
            mt: 3, borderRadius: '30px', backgroundColor: '#ff9f1c',
            '&:hover': { borderColor: '#fff', backgroundColor: '#ff9f1c22' },
          }}
        >
          Log In
        </Button>
      </Box>
    </Paper>
  );
}
