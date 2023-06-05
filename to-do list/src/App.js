import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';

const App = () => {
  // armazenar as tarefas
  const [tasks, setTasks] = useState([]);
  // armazenar mensagens de erro
  const [error, setError] = useState('');
  // controlar a exibição apenas de tarefas importantes
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  // controlar a exibição apenas de tarefas pendentes
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  // armazenar mensagens de sucesso
  const [successMessage, setSuccessMessage] = useState('');

  // Função executada ao carregar o componente para buscar as tarefas da API
  useEffect(() => {
    fetchData();
  }, []);

  // Função para buscar as tarefas da API
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tasks');
      setTasks(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // adicionar uma nova tarefa
  const addTask = async (title, important) => {
    try {
      const response = await axios.post('http://localhost:3001/tasks', { title, important });
      setTasks([...tasks, response.data]);
      setSuccessMessage('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.log(error);
    }
  };

  // atualizar uma tarefa
  const updateTask = async (taskId, updatedTask) => {
    try {
      await axios.put(`http://localhost:3001/tasks/${taskId}`, updatedTask);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      setTasks(updatedTasks);
      setSuccessMessage('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.log(error);
    }
  };

  // marcar uma tarefa como concluída
  const markTaskAsCompleted = async (taskId) => {
    try {
      const taskToUpdate = {
        completed: true,
        title: tasks.find((task) => task.id === taskId).title
      };
      await axios.put(`http://localhost:3001/tasks/${taskId}`, taskToUpdate);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      setTasks(updatedTasks);
      setSuccessMessage('Tarefa marcada como concluída!');
    } catch (error) {
      console.log(error);
    }
  };
  
  // desmarcar uma tarefa como concluída
  const unmarkTaskAsCompleted = async (taskId) => {
    try {
      const taskToUpdate = {
        completed: false,
        title: tasks.find((task) => task.id === taskId).title
      };
      await axios.put(`http://localhost:3001/tasks/${taskId}`, taskToUpdate);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: false } : task
      );
      setTasks(updatedTasks);
      setSuccessMessage('Tarefa desmarcada como concluída!');
    } catch (error) {
      console.log(error);
    }
  };
  

  // excluir uma tarefa
  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta tarefa?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/tasks/${taskId}`);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      setSuccessMessage('Tarefa excluída com sucesso!');
    } catch (error) {
      console.log(error);
    }
  };

  // validar se o formulario foi preenchido
  const handleAddTask = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    const important = e.target.elements.important.checked;

    if (title.trim() === '') {
      setError('Por favor, preencha o campo de tarefa.');
      return;
    }

    addTask(title, important);
    e.target.elements.title.value = '';
    setError('');
  };

  // exibir apenas de tarefas importantes
  const toggleShowImportantOnly = () => {
    setShowImportantOnly(!showImportantOnly);
  };

  // exibir apenas de tarefas pendentes
  const toggleShowPendingOnly = () => {
    setShowPendingOnly(!showPendingOnly);
  };

  // Filtra as tarefas de acordo com as opções selecionadas
  const filteredTasks = tasks.filter((task) => {
    if (showImportantOnly && showPendingOnly) {
      return task.important && !task.completed;
    } else if (showImportantOnly) {
      return task.important;
    } else if (showPendingOnly) {
      return !task.completed;
    }
    return true;
  });

  return (
    <div className="container">
      <div className="lista-tarefas">
        <h1 className="titulo">Lista de Tarefas</h1>

        <form className="form" onSubmit={handleAddTask}>
          <input className="input" type="text" name="title" placeholder="Adicione uma tarefa" />

          <label>
            Importante:
            <input type="checkbox" name="important" />
          </label>
          <button className="adicionar" type="submit">
            Adicionar
          </button>
        </form>
        <hr className="linha"></hr>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <div className="filtro">
          <label className="filtros">
            Mostrar apenas tarefas importantes:
            <input
              type="checkbox"
              checked={showImportantOnly}
              onChange={toggleShowImportantOnly}
            />
          </label>

          <label className="filtros">
            Mostrar apenas tarefas pendentes:
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={toggleShowPendingOnly}
            />
          </label>
        </div>
        <ul>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={task.completed ? 'completed' : ''}
            >
              {task.isEditing ? (
                <div>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) =>
                      updateTask(task.id, {
                        title: e.target.value,
                        important: task.important,
                        completed: task.completed,
                        isEditing: true,
                      })
                    }
                  />
                  <label>
                    Importante:
                    <input
                      type="checkbox"
                      checked={task.important}
                      onChange={(e) =>
                        updateTask(task.id, {
                          title: task.title,
                          important: e.target.checked,
                          completed: task.completed,
                          isEditing: true,
                        })
                      }
                    />
                  </label>
                  <button className="btn"
                    onClick={() =>
                      updateTask(task.id, {
                        isEditing: false,
                        important: task.important,
                        completed: task.completed,
                      })
                    }
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="tarefa">
                    <span>{task.title}</span>
                    <span style={{ fontStyle: 'italic', marginLeft: '10px' }}>
                      {task.important ? '(Importante)' : '(Cotidiana)'}
                    </span>
                  </div>

                  {task.completed ? (
                    <button className="btn" onClick={() => unmarkTaskAsCompleted(task.id)}>
                      Desmarcar
                    </button>
                  ) : (
                    <button className="btn" onClick={() => markTaskAsCompleted(task.id)}>
                      Concluir
                    </button>
                  )}
                  <button className="btn"
                    onClick={() =>
                      updateTask(task.id, {
                        isEditing: true,
                        title: task.title,
                        important: task.important,
                        completed: task.completed,
                      })
                    }
                    disabled={task.completed}
                  >
                    Editar
                  </button>
                  <button className="btn" onClick={() => deleteTask(task.id)}>
                    Excluir
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
