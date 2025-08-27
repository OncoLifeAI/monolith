import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Title, 
  Content, 
  PageHeader, 
  PageTitle
} from '@oncolife/ui-components';
import { 
  TextField, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import { Search, Plus, Edit } from 'lucide-react';
import styled from 'styled-components';
import { useStaff, type Staff } from '../../services/staff';
// import AddStaffModal from './components/AddStaffModal';
// import EditStaffModal from './components/EditStaffModal';

// Temporary placeholder modals
const AddStaffModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => 
  open ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        minWidth: '400px'
      }}>
        <h3>Add Staff Modal</h3>
        <p>Add staff functionality will be implemented here</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  ) : null;

const EditStaffModal = ({ open, onClose, staff }: { open: boolean; onClose: () => void; staff: Staff | null }) => 
  open ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        minWidth: '400px'
      }}>
        <h3>Edit Staff Modal</h3>
        <p>Edit staff functionality for {staff?.firstName} {staff?.lastName} will be implemented here</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  ) : null;

// Theme
const theme = {
  colors: {
    primary: '#007bff',
    gray: {
      300: '#d1d5db',
      400: '#9ca3af',
      600: '#6b7280',
      700: '#374151'
    }
  }
};
const StaffContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
  z-index: 1;
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const StyledTable = styled(Table)`
  .MuiTableCell-head {
    background-color: #e3f2fd;
    font-weight: 600;
    color: #1976d2;
    border-bottom: 2px solid #e0e0e0;
    padding: 1rem 1.5rem;
  }
  
  .MuiTableCell-body {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .MuiTableRow-root:nth-of-type(even) {
    background-color: #fafafa;
  }
  
  .MuiTableRow-root:hover {
    background-color: #f5f5f5;
  }
  
  .MuiTableRow-root:last-child .MuiTableCell-body {
    border-bottom: none;
  }
`;

// Staff type is now imported from services/staff

const StaffPage: React.FC = () => {
  const [page, setPage] = useState(0); // TablePagination uses 0-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Real API call
  const { data, isLoading, error } = useStaff(page + 1, search, rowsPerPage);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when searching
  };
  
  const handleAddStaff = () => {
    setIsAddModalOpen(true);
  };
  
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };
  
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStaff(null);
  };
  
  const getStartRecord = () => {
    return data ? page * rowsPerPage + 1 : 0;
  };
  
  const getEndRecord = () => {
    return data ? Math.min((page + 1) * rowsPerPage, data.total) : 0;
  };
  
  return (
    <Container>
      <Header>
        <Title>Staff</Title>
      </Header>
      
      <Content>
        <PageHeader>
          <PageTitle>Manage Staff</PageTitle>
        </PageHeader>
        
        <StaffContainer>
          <HeaderControls>
            <SearchContainer>
              <SearchIcon>
                <Search size={20} />
              </SearchIcon>
              <TextField
                fullWidth
                placeholder="Search Staff..."
                value={search}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    paddingLeft: '40px',
                  }
                }}
              />
            </SearchContainer>
            
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={handleAddStaff}
              sx={{
                backgroundColor: theme.colors.primary,
                '&:hover': {
                  backgroundColor: '#0056b3',
                }
              }}
            >
              Add Staff
            </Button>
          </HeaderControls>
          
          {error && (
            <Typography color="error" variant="body2">
              Error loading staff: {error.message || 'Please try again.'}
            </Typography>
          )}
          
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableWrapper>
              <TableContainer>
                <StyledTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Clinic Name</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.data.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          {staff.firstName} {staff.lastName}
                        </TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>{staff.clinicName || '-'}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit Staff">
                            <IconButton
                              size="small"
                              onClick={() => handleEditStaff(staff)}
                              sx={{ color: theme.colors.primary }}
                            >
                              <Edit size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </StyledTable>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={data?.total || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Rows per page:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                  }
                  disabled={!data || data.total <= rowsPerPage}
                  sx={{
                    '.MuiTablePagination-selectLabel': {
                      color: theme.colors.gray[600],
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      marginRight: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0',
                      lineHeight: '1.5',
                    },
                    '.MuiTablePagination-displayedRows': {
                      color: theme.colors.gray[600],
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'baseline',
                      lineHeight: '1.5',
                    },
                    '.MuiTablePagination-select': {
                      color: theme.colors.gray[700],
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      marginLeft: '0.5rem',
                      marginRight: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '0',
                      height: 'auto',
                      '& .MuiSelect-select': {
                        paddingRight: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '0',
                        paddingBottom: '0',
                        lineHeight: '1.5',
                        margin: '0',
                        verticalAlign: 'baseline',
                        transform: 'translateY(0)',
                        height: 'auto',
                        minHeight: 'auto',
                        boxSizing: 'border-box',
                      },
                      '& .MuiSelect-select.MuiSelect-select': {
                        paddingTop: '0',
                        paddingBottom: '0',
                        lineHeight: '1.5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'auto',
                        minHeight: 'auto',
                        boxSizing: 'border-box',
                      },
                      '& .MuiOutlinedInput-root': {
                        height: 'auto',
                        minHeight: 'auto',
                        '& fieldset': {
                          border: 'none',
                        },
                      },
                    },
                    '.MuiTablePagination-actions': {
                      '.MuiIconButton-root': {
                        color: theme.colors.gray[600],
                        '&:hover': {
                          backgroundColor: 'rgba(0, 123, 255, 0.08)',
                          color: theme.colors.primary,
                        },
                        '&.Mui-disabled': {
                          color: theme.colors.gray[300],
                        },
                      },
                    },
                    '.MuiTablePagination-toolbar': {
                      padding: '1rem 2rem',
                      borderTop: '1px solid #e0e0e0',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      minHeight: '52px',
                    },
                  }}
                />
              </TableContainer>
            </TableWrapper>
          )}
        </StaffContainer>
      </Content>
      
      <AddStaffModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
      
      <EditStaffModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        staff={selectedStaff}
      />
    </Container>
  );
};

export default StaffPage; 