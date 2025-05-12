import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, FitnessCenter } from '@mui/icons-material';

export default function RegisterCard({
  title,
  values,
  handleChange,
  handleClickShowPassword,
  handleClickShowConfirm,
  handleSubmit,
}) {
  return (
    <Paper
      elevation={4}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(28,28,28,0.75)',
        borderRadius: 3,
        p: 4,
        color: '#fff',
        width: '100%',
        maxWidth: '700px',
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <FitnessCenter sx={{ fontSize: 48, color: 'secondary.main' }} />
        <Typography variant="h5" component="h1" sx={{ mt: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your account to continue
        </Typography>
      </Box>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <TextField
          fullWidth required margin="normal"
          label="Username or Email"
          variant="filled" InputProps={{ disableUnderline: true }}
          sx={{
            '& .MuiFilledInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(200,200,200,0.15)',
              '& input': { color: '#fff' },
            },
            '& .MuiInputLabel-root': { color: '#ccc' },
          }}
          value={values.username}
          onChange={handleChange('username')}
        />

        <TextField
          fullWidth required margin="normal"
          label="Password"
          variant="filled" type={values.showPassword ? 'text' : 'password'}
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#ccc' }}>
                  { values.showPassword ? <VisibilityOff/> : <Visibility/> }
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiFilledInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(200,200,200,0.15)',
              '& input': { color: '#fff' },
            },
            '& .MuiInputLabel-root': { color: '#ccc' },
          }}
          value={values.password}
          onChange={handleChange('password')}
        />

        <TextField
          fullWidth required margin="normal"
          label="Confirm Password"
          variant="filled" type={values.showConfirm ? 'text' : 'password'}
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowConfirm} edge="end" sx={{ color: '#ccc' }}>
                  { values.showConfirm ? <VisibilityOff/> : <Visibility/> }
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiFilledInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(200,200,200,0.15)',
              '& input': { color: '#fff' },
            },
            '& .MuiInputLabel-root': { color: '#ccc' },
          }}
          value={values.confirm}
          onChange={handleChange('confirm')}
        />

        
        <Button
          type="submit"
          fullWidth variant="contained" size="large"
          sx={{
            mt: 3,
            borderRadius: '30px',
            backgroundColor: '#ff9f1c',
            '&:hover': { backgroundColor: '#ffaa2c' },
          }}
        >
          Sign Up
        </Button>
      </Box>
    </Paper>
  );
}
