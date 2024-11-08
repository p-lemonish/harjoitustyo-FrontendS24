import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Autocomplete,
  TextField,
  ListItemButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Workouts() {
  const [plannedWorkouts, setPlannedWorkouts] = useState([]);
  const [workoutNames, setWorkoutNames] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAddWorkout = () => {
    navigate('/add-workout');
  };
  const handleEditWorkout = async (id) => {
    navigate(`/edit-workout/${id}`);
  };
  const handleDeleteWorkout = async (id) => {
    try {
      await api.delete(`/workouts/delete-planned/${id}`);
      fetchPlannedWorkouts();
      setError(null);
    } catch (err) {
      console.error('Error deleting planned workout', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const errorMessages = Object.entries(errorData).map(
          ([field, message]) => `${message}`
        );
        setError(errorMessages);
      }
    }
  };
  const handleStartWorkout = async (id) => {
    navigate(`/start-workout/${id}`);
  };
  const fetchPlannedWorkouts = async () => {
    try {
      const response = await api.get('/workouts');
      setPlannedWorkouts(response.data);
      const uniqueNames = [
        ...new Set(
          response.data
            .map((workout) => workout.workoutName)
            .filter((name) => name != null)
        ),
      ];
      setWorkoutNames(uniqueNames);
    } catch (err) {
      console.error('Error fetching planned exercises', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load planned workouts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedWorkouts();
  }, [authState.token, logout, navigate]);

  if (loading)
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '64px',
          paddingTop: '20px',
        }}>
        <CircularProgress />
      </Container>
    );

  const filteredWorkouts = selectedWorkout
    ? plannedWorkouts.filter(
        (workout) => workout.workoutName === selectedWorkout
      )
    : plannedWorkouts;

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        paddingBottom: '64px',
        paddingTop: '20px',
      }}>
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Planned Workouts
        </Typography>
        <Autocomplete
          options={workoutNames}
          value={selectedWorkout}
          getOptionLabel={(option) => (option ? option : '')}
          onChange={(event, newValue) => {
            setSelectedWorkout(newValue || '');
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search Workouts" variant="outlined" />
          )}
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          color="primary"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddWorkout}
          fullWidth>
          Plan a New Workout
        </Button>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Tap on a workout to start it.
        </Typography>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1, mb: 1 }}>
        {plannedWorkouts.length === 0 ? (
          <Typography variant="body1">No planned workouts found</Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {filteredWorkouts.map((workout) => (
              <React.Fragment key={workout.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="start"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkout(workout.id);
                        }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(workout.id);
                        }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }>
                  <ListItemButton
                    onClick={() => handleStartWorkout(workout.id)}>
                    <ListItemText
                      primary={workout.workoutName}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pr: 5,
                        },
                      }}
                      secondary={workout.plannedDate}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}
export default Workouts;
