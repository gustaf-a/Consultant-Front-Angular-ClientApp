import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs"
import { map, tap, catchError, retry } from 'rxjs/operators';
import { Consultant } from "./consultant";


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private consultantsAPI = "api/consultants";
  private hostAddress = "http://localhost:8888/";
  private consultantsAPIURL = this.hostAddress+ this.consultantsAPI ;

  constructor(private http: HttpClient) {
  }

  getAllConsultants(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.consultantsAPIURL)
      .pipe(
        tap(data => console.log('getAllConsultants: ' + JSON.stringify(data))),
        catchError(this.errorHandler)
      );
  }

  getConsultantByID(id: number, includeAddresses?: boolean): Observable<Consultant> {
    if (id === 0) {
      return of(this.newConsultant());
    }
    let urlString: string = this.consultantsAPIURL + "/" + id;
    if (includeAddresses) { urlString = urlString + "?includeAddress=true"; }
    return this.http.get<Consultant>(urlString)
      .pipe(
        retry(1),
        //tap(data => console.log('getConsultantByID: ' + JSON.stringify(data))),
        catchError(this.errorHandler)
      );
  }

  newConsultant(): Consultant {
    return {
      consultantId: 0,
      nameFirst: "",
      nameSecond: "",
      email: "",
      telephone: "",
      birthDate: new Date,
      imageURL: "",
      addresses: []
    };
  }

  createConsultant(consultant: Consultant): Observable<Consultant> {
    console.log('dataservice starting');
    const headers = new HttpHeaders({
       'Content-Type': 'application/json' });
    return this.http.post<Consultant>(this.consultantsAPIURL,
       consultant, { headers: headers })
      .pipe(
        retry(1),
        //tap(data => console.log('createConsultant: ' + JSON.stringify(data))),
        catchError(this.errorHandler)
      );
  }

  updateConsultant(consultant: Consultant): Observable<Consultant> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let urlString: string = this.consultantsAPIURL + "/" + consultant.consultantId;
    return this.http.put<Consultant>(urlString, consultant, { headers: headers })
      .pipe(
        tap(() => console.log('updateConsultant: ' + consultant.consultantId)),
        // Return the product on an update
        map(() => consultant),
        catchError(this.errorHandler)
      );
  }

  deleteConsultant(id: number): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let urlString: string = this.consultantsAPIURL + "/" + id;
    return this.http.delete<Consultant>(urlString, { headers: headers })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  private errorHandler(theError) {
    
    let errorMessage: string;
    console.error(theError);
    if (theError.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${theError.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${theError.status}: ${theError.message}`;
    }
    return throwError(errorMessage);
  }

}
