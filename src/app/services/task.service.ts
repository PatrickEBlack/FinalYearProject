// src/app/tasks.service.ts
/**
 * This service manages task data using Firebase/Firestore.
 * It handles user authentication state and provides methods for CRUD operations on tasks.
 */
import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  updateDoc,
  where,
  addDoc,
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, switchMap, of } from 'rxjs';

/**
 * Interface defining the structure of a Task.
 * @property id - Optional unique identifier (provided by Firestore)
 * @property content - The task description or content
 * @property completed - Boolean indicating if the task is done
 * @property user - Optional user ID who owns the task
 */
export interface Task {
  id?: string;
  content: string;
  completed: boolean;
  user?: string;
}

/**
 * Service responsible for managing tasks in the application.
 * Uses Firebase Authentication and Firestore for data persistence.
 */
@Injectable({ providedIn: 'root' })
export class TasksService {
  // Inject Firestore service to interact with Firestore and access tasks collection
  private readonly firestoreDb = inject(Firestore);
  // Inject the Auth service to manage user authentication
  private readonly authService = inject(Auth);
  // Reference to the 'tasks' collection in Firestore database used to interact with tasks
  private readonly tasksCollectionRef = collection(this.firestoreDb, 'tasks');
  
  /**
   * BehaviorSubject keeping track of the current authenticated user.
   * BehaviorSubject is used because it:
   * 1. Requires an initial value
   * 2. Caches the latest value
   * 3. Emits the latest value to new subscribers
   */
  private readonly authenticatedUser$ = new BehaviorSubject(this.authService.currentUser);

  /**
   * Observable stream of tasks that automatically updates based on authentication state.
   * Using switchMap to cancel previous subscriptions when user changes and create
   * new subscriptions for the new user state.
   */
  readonly userTasks$ = this.authenticatedUser$.pipe(
    switchMap(user => !user ? of([]) : 
      collectionData(
        query(this.tasksCollectionRef, where('user', '==', user.uid)),
        { idField: 'id' }
      ) as Observable<Task[]>
    )
  );

  constructor() {
    // Set up authentication state listener
    onAuthStateChanged(this.authService, user => this.authenticatedUser$.next(user));
  }

  /**
   * Returns an Observable of all tasks for the current user.
   * The Observable automatically updates when:
   * 1. User logs in/out
   * 2. Tasks are added/modified/deleted
   */
  getUserTasks(): Observable<Task[]> {
    return this.userTasks$;
  }

  /**
   * Creates a new task in Firestore.
   * @param task The task to create (without id and user)
   * @returns Promise that resolves when the task is created
   */
  async createTask(task: Task) {
    const userId = this.authService.currentUser?.uid;
    return addDoc(this.tasksCollectionRef, { ...task, user: userId });
  }

  /**
   * Updates an existing task's content in Firestore.
   * @param task The task to update (must include id)
   * @returns Promise that resolves when the update is complete
   */
  async updateTask({ id, content }: Task) {
    return updateDoc(doc(this.firestoreDb, `tasks/${id}`), { content });
  }

  /**
   * Deletes a task from Firestore.
   * @param task The task to delete (must include id)
   * @returns Promise that resolves when the deletion is complete
   */
  async deleteTask({ id }: Task) {
    return deleteDoc(doc(this.firestoreDb, `tasks/${id}`));
  }

  /**
   * Toggles the completed status of a task in Firestore.
   * @param task The task to toggle (must include id and completed status)
   * @returns Promise that resolves when the update is complete
   */
  async toggleTaskCompleted({ id, completed }: Task) {
    return updateDoc(doc(this.firestoreDb, `tasks/${id}`), { completed });
  }
}