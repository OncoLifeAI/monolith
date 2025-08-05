import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  CircularProgress
} from '@mui/material';
import { Header, Title, Content } from '@patient-portal/ui-components';
import { Search, Edit, Plus } from 'lucide-react';
import styled from 'styled-components';
import { useStaff } from '@patient-portal/api-client';
import type { Staff } from '@patient-portal/api-client';
import { theme } from '@patient-portal/theme-lib';
import AddStaffModal from './components/AddStaffModal';
import EditStaffModal from './components/EditStaffModal';

// Styled components
const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchField = styled(TextField)`
  flex: 1;
  max-width: 300px;
`;

const ActionButton = styled(Button)`
  background-color: ${theme.colors.primary};
  color: white;
  &:hover {
    background-color: ${theme.colors.primary};
    opacity: 0.9;
  }
`;

const TableContainerStyled = styled(TableContainer)`
  margin-top: 1rem;
`;

const StatusChip = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'Active': return theme.colors.success;
      case 'Inactive': return theme.colors.error;
      default: return theme.colors.gray[400];
    }
  }};
  color: white;
`;

const StaffPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const { data: staff, isLoading, error } = useStaff(
    page + 1,
    searchTerm,
    rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleAddStaff = () => {
    setIsAddModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setEditingStaff(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">Error loading staff</Typography>
    );
  }

  return (
    <>
      <Header>
        <Title>Manage Staff</Title>
      </Header>
      <Content>
        <SearchContainer>
          <SearchField
            placeholder="Search staff..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <ActionButton
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={handleAddStaff}
          >
            Add Staff
          </ActionButton>
        </SearchContainer>

        <TableContainerStyled>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff?.data?.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    <Typography variant="body2" color={theme.colors.gray[700]}>
                      {staffMember.firstName} {staffMember.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={theme.colors.gray[600]}>
                      {staffMember.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={theme.colors.gray[600]}>
                      {staffMember.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status="Active">
                      Active
                    </StatusChip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Staff">
                      <IconButton
                        size="small"
                        onClick={() => handleEditStaff(staffMember)}
                        sx={{ color: theme.colors.primary }}
                      >
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainerStyled>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={staff?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Content>

      <AddStaffModal
        open={isAddModalOpen}
        onClose={handleCloseModals}
      />

      {editingStaff && (
        <EditStaffModal
          open={!!editingStaff}
          staff={editingStaff}
          onClose={handleCloseModals}
        />
      )}
    </>
  );
};

export default StaffPage; 