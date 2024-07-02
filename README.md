SaludNet
SaludNet es una página web interactiva sobre consultorios médicos, donde los usuarios pueden observar a los profesionales que allí atienden y obtener un turno si lo desean.

Objetivo
Nuestro objetivo es brindarle la posibilidad a un grupo de profesionales de la salud a que puedan administrar su propio sitio seguro, accesible solo a través de un usuario registrado. Los profesionales pueden incorporar, editar o eliminar su lista de oferta profesional y su agenda laboral.

Tecnologías Utilizadas
Base de datos: MySQL Workbench
Backend: NestJs
Frontend: React
Repositorios
Frontend: SaludNetFront
Backend: SaludNetTorm2
Dependencias
Backend
@nestjs/common
@nestjs/core "^10.0.0"
@nestjs/jwt
@nestjs/mapped-types
@nestjs/platform-express
@nestjs/typeorm
bcryptjs
class-transformer
class-validator
dotenv
mysql2
reflect-metadata
rxjs
typeorm
Frontend
@fortawesome/free-brands-svg-icons
@fortawesome/free-solid-svg-icons
@fortawesome/react-fontawesome
react
react-calendar
react-dom
react-loader-spinner
react-modal
react-parallax
react-router-dom
react-select
react-slick
react-spinners
slick-carousel
sweetalert2
Variables de Entorno
SECRET=
DB_TYPE=
HOST=
USER_DB_NAME=
USER_DB_PASSWORD=
PORT=
DB_NAME=

Base de Datos
Utilizamos MySQL Workbench para gestionar nuestra base de datos. A continuación, se detalla la estructura de las entidades y sus relaciones.

Entidades

Admin
coverages
Person
Doctor (hereda de Person)
Patient (hereda de Person)
Schedule
Shiff
Speciality

Backend (NestJS)
Estructura del Proyecto
src/
|-- controllers/
|-- services/
|-- models/
|-- ...
Controladores
AdminController
POST /admin/login - Iniciar sesión de un administrador
GET /admin/:email - Obtener información de un administrador por email
AuthController
POST /auth/login - Iniciar sesión de un usuario
CoverageController
POST /coverage - Crear una cobertura
GET /coverage - Obtener todas las coberturas
GET /coverage/:id - Obtener una cobertura por ID
PUT /coverage/:id - Actualizar una cobertura por ID
DELETE /coverage/:id - Eliminar una cobertura por ID
DoctorsController
POST /doctors - Crear un doctor
GET /doctors - Obtener todos los doctores
GET /doctors/shiffAvailable/:idDoctor - Obtener turnos disponibles de un doctor
GET /doctors/:id - Obtener un doctor por ID
PUT /doctors/:id - Actualizar un doctor por ID
DELETE /doctors/:id - Eliminar un doctor por ID
POST /doctors/addCoverage - Agregar una cobertura a un doctor
DELETE /doctors/remove/coverage - Eliminar una cobertura de un doctor
GET /doctors/patients/:id - Obtener pacientes de un doctor por ID de doctor
PatientsController
POST /patients - Crear un paciente
GET /patients - Obtener todos los pacientes
GET /patients/:id - Obtener un paciente por ID
PUT /patients/:id - Actualizar un paciente por ID
DELETE /patients/:id - Eliminar un paciente por ID
GET /patients/by-dni/:dni - Obtener un paciente por DNI
ScheduleController
POST /schedules - Crear un horario
GET /schedules - Obtener todos los horarios
GET /schedules/:id - Obtener un horario por ID
DELETE /schedules/:id - Eliminar un horario por ID
PUT /schedules/updateAvailability/:idSchedule - Actualizar disponibilidad de un horario
GET /schedules/count - Contar horarios
GET /schedules/byDay - Obtener horarios por día
GET /schedules/by-doctor/:idDoctor - Obtener horarios por ID de doctor
ShiffController
POST /shiff - Crear un turno
GET /shiff - Obtener todos los turnos
GET /shiff/:id - Obtener un turno por ID
DELETE /shiff/:id - Eliminar un turno por ID
SpecialityController
POST /speciality - Crear una especialidad
GET /speciality - Obtener todas las especialidades
GET /speciality/:id - Obtener una especialidad por ID
PUT /speciality/:id - Actualizar una especialidad por ID
DELETE /speciality/:id - Eliminar una especialidad por ID
Servicios
AdminService
create - Crear un administrador
findByEmail - Encontrar un administrador por email
AuthService
login - Iniciar sesión de un usuario
CoveragesService
create - Crear una cobertura
getCoverage - Obtener todas las coberturas
findOneCoverages - Encontrar una cobertura por ID
updateCoverages - Actualizar una cobertura por ID
deleteCoverage - Eliminar una cobertura por ID
DoctorsService
create - Crear un doctor
addCoverageToDoctor - Agregar una cobertura a un doctor
removeCoverageFromDoctor - Eliminar una cobertura de un doctor
getDoctors - Obtener todos los doctores
getDoctorsShiff - Obtener turnos de un doctor
findOneDoctor - Encontrar un doctor por ID
updateDoctor - Actualizar un doctor por ID
deleteDoctor - Eliminar un doctor por ID
findPatientsByDoctorId - Encontrar pacientes por ID de doctor
PatientsService
create - Crear un paciente
getPatients - Obtener todos los pacientes
findOnePatient - Encontrar un paciente por ID
updatePatient - Actualizar un paciente por ID
deletePatient - Eliminar un paciente por ID
findByDni - Encontrar un paciente por DNI
ScheduleService
createScheduleWithInterval - Crear un horario con intervalo
getSchedules - Obtener todos los horarios
findOneSchedule - Encontrar un horario por ID
deleteSchedule - Eliminar un horario por ID
updateAvailability - Actualizar disponibilidad de un horario
findScheduleByDay - Encontrar horarios por día
countScheduleByDoctor - Contar horarios por doctor
getSchedulesByDoctor - Obtener horarios por doctor
ShiffService
takeShiff - Tomar un turno
getShiff - Obtener todos los turnos
findOneShiff - Encontrar un turno por ID
deleteShiff - Eliminar un turno por ID
SpecialityService
create - Crear una especialidad
getSpeciality - Obtener todas las especialidades
findOneSpeciality - Encontrar una especialidad por ID
updateSpeciality - Actualizar una especialidad por ID
deleteSpeciality - Eliminar una especialidad por ID

Testing
npm run test
npm run test:e2e
npm run test:cov

Frontend (React)
Estructura del Proyecto
src/
|-- components/
|-- pages/
|-- ...
Componentes
Contacto.jsx datos del lugar
Coverage.jsx agrega obras sociales
CreateSchedule.jsx crea los turnos disponibles para un doctor
CreateSpeciality.jsx crea la especialidad del doctor
DeleteOneSchedule.jsx elimina un turno disponible
DeleteSchedule.jsx elimina un turno disponible
EditShifts.jsx elimina turnos reservados
Footer.jsx
FormPatient.jsx
FormProfesionals.jsx Crea un doctor
ListProfesionals.jsx edita datos del doctor
Marketing.jsx diseño
NavBar.jsx
SpanContinue.jsx
Spinner.jsx
UserContext.jsx
VerTurnos.jsx listado de turnos reservados por día y doctor

Pages

Admin.jsx
Home.jsx
Login.jsx
NotFound.jsx
Novedades.jsx
Profesionales.jsx
SobreNosotros.jsx
Turnos.jsx

Creador: SaludNet Team: Marina Erasun, Ignacio Molina, Manuel Sevedro, Karina D'Espósito
