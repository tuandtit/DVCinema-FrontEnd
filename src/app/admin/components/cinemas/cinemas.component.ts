import { Component, OnInit } from '@angular/core';

interface Cinema {
  id: number;
  name: string;
  address: string;
  numberOfRooms: number; // Số phòng chiếu
  status: 'active' | 'inactive'; // Trạng thái: Đang hoạt động hoặc Ngừng hoạt động
}

@Component({
  selector: 'app-cinemas',
  templateUrl: './cinemas.component.html',
  styleUrls: ['./cinemas.component.scss'],
})
export class CinemasComponent implements OnInit {
  cinemas: Cinema[] = [
    {
      id: 1,
      name: 'DVCinema Quận 1',
      address: '123 Lê Lợi, Quận 1, TP.HCM',
      numberOfRooms: 5,
      status: 'active',
    },
    {
      id: 2,
      name: 'DVCinema Quận 7',
      address: '456 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
      numberOfRooms: 4,
      status: 'active',
    },
    {
      id: 3,
      name: 'DVCinema Thủ Đức',
      address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM',
      numberOfRooms: 3,
      status: 'inactive',
    },
  ];

  filteredCinemas: Cinema[] = [...this.cinemas]; // Danh sách rạp sau khi lọc/tìm kiếm
  searchTerm: string = '';
  statusFilter: string = 'all'; // Lọc theo trạng thái: all, active, inactive

  showAddForm: boolean = false; // Hiển thị form thêm rạp_DLL
  showEditForm: boolean = false; // Hiển thị form sửa rạp
  newCinema: Cinema = { id: 0, name: '', address: '', numberOfRooms: 0, status: 'active' };
  editCinema: Cinema | null = null;

  ngOnInit(): void {
    this.filterCinemas();
  }

  // Tìm kiếm và lọc rạp
  filterCinemas(): void {
    let tempCinemas = [...this.cinemas];

    // Tìm kiếm theo tên rạp
    if (this.searchTerm) {
      tempCinemas = tempCinemas.filter((cinema) =>
        cinema.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (this.statusFilter !== 'all') {
      tempCinemas = tempCinemas.filter((cinema) => cinema.status === this.statusFilter);
    }

    this.filteredCinemas = tempCinemas;
  }

  // Thêm rạp mới
  addCinema(): void {
    if (!this.newCinema.name || !this.newCinema.address || !this.newCinema.numberOfRooms) {
      alert('Vui lòng điền đầy đủ thông tin rạp!');
      return;
    }

    const newId = this.cinemas.length ? Math.max(...this.cinemas.map((c) => c.id)) + 1 : 1;
    this.cinemas.push({ ...this.newCinema, id: newId });
    this.filteredCinemas = [...this.cinemas];
    this.newCinema = { id: 0, name: '', address: '', numberOfRooms: 0, status: 'active' };
    this.showAddForm = false;
    this.filterCinemas();
  }

  // Mở form sửa rạp
  openEditForm(cinema: Cinema): void {
    this.editCinema = { ...cinema };
    this.showEditForm = true;
  }

  // Sửa rạp
  updateCinema(): void {
    if (!this.editCinema) return;

    const index = this.cinemas.findIndex((c) => c.id === this.editCinema!.id);
    if (index !== -1) {
      this.cinemas[index] = { ...this.editCinema };
      this.filteredCinemas = [...this.cinemas];
      this.editCinema = null;
      this.showEditForm = false;
      this.filterCinemas();
    }
  }

  // Xóa rạp
  deleteCinema(id: number): void {
    if (confirm('Bạn có chắc muốn xóa rạp này?')) {
      this.cinemas = this.cinemas.filter((cinema) => cinema.id !== id);
      this.filteredCinemas = [...this.cinemas];
      this.filterCinemas();
    }
  }

  // Hủy form
  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newCinema = { id: 0, name: '', address: '', numberOfRooms: 0, status: 'active' };
    this.editCinema = null;
  }
}
