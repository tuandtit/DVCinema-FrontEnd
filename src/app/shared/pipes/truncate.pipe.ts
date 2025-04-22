import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPipe',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VNĐ',
    }).format(value);
  }
}
