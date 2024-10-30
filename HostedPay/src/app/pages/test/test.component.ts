import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor(private router: Router){
    
  }
  
  ngOnInit(){
    // const sid = 1;
    // const txref = '0x9fea8411d3716a7f9a8e99c3e0ce2e491e2120284d1fa7afbe4fa22341248984';
    // console.log(`Navigating to /${txref}/${sid}`);
    // this.router.navigate([`/${sid}/${txref}`]).catch(error => {
    //   console.error('Navigation error:', error);
    // });
  }
}
