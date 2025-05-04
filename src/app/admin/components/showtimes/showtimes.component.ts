import { Component, OnInit } from '@angular/core';

interface Showtime {
  id: number;
  movie: string; // Tên phim
  cinema: string; // Tên rạp
  room: string; // Phòng chiếu
  startTime: string; // Thời gian bắt đầu (YYYY-MM-DDTHH:mm)
  endTime: string; // Thời gian kết thúc (YYYY-MM-DDTHH:mm)
  status: 'ongoing' | 'upcoming'; // Trạng thái: Đang diễn ra hoặc Sắp diễn ra
}

@Component({
  selector: 'app-showtimes',
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.scss']
})
export class ShowtimesComponent implements OnInit {
  showtimes: Showtime[] = [
    { id: 1, movie: 'The Matrix', cinema: 'DVCinema Quận 1', room: 'Phòng 1', startTime: '2025-04-26T14:00', endTime: '2025-04-26T16:16', status: 'upcoming' },
    { id: 2, movie: 'Inception', cinema: 'DVCinema Quận 7', room: 'Phòng 2', startTime: '2025-04-25T19:00', endTime: '2025-04-25T21:28', status: 'ongoing' },
    { id: 3, movie: 'Dune: Part Two', cinema: 'DVCinema Thủ Đức', room: 'Phòng 3', startTime: '2025-04-27T15:30', endTime: '2025-04-27T18:16', status: 'upcoming' }
  ];

  filteredShowtimes: Showtime[] = [...this.showtimes]; // Danh sách suất chiếu sau khi lọc/tìm kiếm
  searchTerm: string = '';
  statusFilter: string = 'all'; // Lọc theo trạng thái: all, ongoing, upcoming

  showAddForm: boolean = false; // Hiển thị form thêm suất chiếu
  showEditForm: boolean = false; // Hiển thị form sửa suất chiếu
  newShowtime: Showtime = { id: 0, movie: '', cinema: '', room: '', startTime: '', endTime: '', status: 'ongoing' };
  editShowtime: Showtime | null = null;

  ngOnInit(): void {
    this.filterShowtimes();
  }

  // Tìm kiếm và lọc suất chiếu
  filterShowtimes(): void {
    let tempShowtimes = [...this.showtimes];

    // Tìm kiếm theo tên phim
    if (this.searchTerm) {
      tempShowtimes = tempShowtimes.filter(showtime =>
        showtime.movie.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (this.statusFilter !== 'all') {
      tempShowtimes = tempShowtimes.filter(showtime => showtime.status === this.statusFilter);
    }

    this.filteredShowtimes = tempShowtimes;
  }

  // Thêm suất chiếu mới
  addShowtime(): void {
    if (!this.newShowtime.movie || !this.newShowtime.cinema || !this.newShowtime.room || !this.newShowtime.startTime || !this.newShowtime.endTime) {
      alert('Vui lòng điền đầy đủ thông tin suất chiếu!');
      return;
    }

    const newId = this.showtimes.length ? Math.max(...this.showtimes.map(s => s.id)) + 1 : 1;
    this.showtimes.push({ ...this.newShowtime, id: newId });
    this.filteredShowtimes = [...this.showtimes];
    this.newShowtime = { id: 0, movie: '', cinema: '', room: '', startTime: '', endTime: '', status: 'ongoing' };
    this.showAddForm = false;
    this.filterShowtimes();
  }

  // Mở form sửa suất chiếu
  openEditForm(showtime: Showtime): void {
    this.editShowtime = { ...showtime };
    this.showEditForm = true;
  }

  // Sửa suất chiếu
  updateShowtime(): void {
    if (!this.editShowtime) return;

    const index = this.showtimes.findIndex(s => s.id === this.editShowtime!.id);
    if (index !== -1) {
      this.showtimes[index] = { ...this.editShowtime };
      this.filteredShowtimes = [...this.showtimes];
      this.editShowtime = null;
      this.showEditForm = false;
      this.filterShowtimes();
    }
  }

  // Xóa suất chiếu
  deleteShowtime(id: number): void {
    if (confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      this.showtimes = this.showtimes.filter(showtime => showtime.id !== id);
      this.filteredShowtimes = [...this.showtimes];
      this.filterShowtimes();
    }
  }

  // Hủy form
  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newShowtime = { id: 0, movie: '', cinema: '', room: '', startTime: '', endTime: '', status: 'ongoing' };
    this.editShowtime = null;
  }

  // Định dạng thời gian
  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  }
}